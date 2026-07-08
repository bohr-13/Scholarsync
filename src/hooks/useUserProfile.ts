'use client';

/**
 * useUserProfile — Real-time Firestore-backed user profile hook.
 *
 * Persists extended profile data (college, course, year, state)
 * and user preferences to Firestore beyond what Firebase Auth stores.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  onUserProfileSnapshot,
  saveUserProfile as fsSaveProfile,
} from '@/lib/firestore';
import { notifyProfileUpdated } from '@/lib/notificationService';
import type { UserProfile } from '@/types';

interface ExtendedProfile extends UserProfile {
  preferences?: {
    darkMode?: boolean;
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    deadlineReminders?: boolean;
    weeklyDigest?: boolean;
  };
}

interface UseUserProfileReturn {
  profile: ExtendedProfile | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<ExtendedProfile>) => Promise<void>;
}

export function useUserProfile(): UseUserProfileReturn {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ExtendedProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = onUserProfileSnapshot(
      user.uid,
      (firestoreProfile) => {
        if (firestoreProfile) {
          setProfile(firestoreProfile as ExtendedProfile);
        } else {
          // Profile doesn't exist in Firestore yet — create a baseline from Auth data
          const baseline: ExtendedProfile = {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            createdAt: new Date().toISOString(),
            preferences: {
              darkMode: true,
              emailNotifications: true,
              pushNotifications: false,
              deadlineReminders: true,
              weeklyDigest: true,
            },
          };
          setProfile(baseline);
          // Persist the baseline to Firestore
          fsSaveProfile(user.uid, baseline).catch(console.error);
        }
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Profile listener error:', err);
        setError('Failed to load profile');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, user?.displayName, user?.email, user?.photoURL]);

  const updateProfile = useCallback(
    async (updates: Partial<ExtendedProfile>): Promise<void> => {
      if (!user?.uid) return;
      try {
        await fsSaveProfile(user.uid, updates);
        notifyProfileUpdated(user.uid);
      } catch (err) {
        console.error('Failed to update profile:', err);
        setError('Failed to save profile');
      }
    },
    [user?.uid]
  );

  return {
    profile,
    isLoading,
    error,
    updateProfile,
  };
}
