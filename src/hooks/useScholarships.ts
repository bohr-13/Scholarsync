'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  onScholarshipsSnapshot,
  saveScholarship as fsSaveScholarship,
  unsaveScholarship as fsUnsaveScholarship,
  onSavedScholarshipsSnapshot,
} from '@/lib/firestore';
import {
  notifyScholarshipSaved,
  notifyScholarshipUnsaved,
} from '@/lib/notificationService';
import type { Scholarship } from '@/types';

interface UseScholarshipsReturn {
  scholarships: Scholarship[];
  savedScholarshipIds: string[];
  isLoading: boolean;
  error: string | null;
  saveScholarship: (id: string) => Promise<void>;
  unsaveScholarship: (id: string) => Promise<void>;
}

export function useScholarships(): UseScholarshipsReturn {
  const { user } = useAuth();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [savedScholarshipIds, setSavedScholarshipIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to all scholarships
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onScholarshipsSnapshot(
      (data) => {
        setScholarships(data);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Scholarships listener error:', err);
        setError('Failed to load scholarships');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Subscribe to saved scholarships for authenticated user
  useEffect(() => {
    if (!user?.uid) {
      setSavedScholarshipIds([]);
      return;
    }

    const unsubscribe = onSavedScholarshipsSnapshot(
      user.uid,
      (savedIds) => {
        setSavedScholarshipIds(savedIds);
      },
      (err) => {
        console.error('Saved scholarships listener error:', err);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const saveScholarship = useCallback(
    async (id: string) => {
      if (!user?.uid) return;
      try {
        await fsSaveScholarship(user.uid, id);
        const scholarship = scholarships.find((s) => s.id === id);
        if (scholarship && user?.uid) {
          notifyScholarshipSaved(user.uid, scholarship.name);
        }
      } catch (err) {
        console.error('Failed to save scholarship:', err);
      }
    },
    [user?.uid, scholarships]
  );

  const unsaveScholarship = useCallback(
    async (id: string) => {
      if (!user?.uid) return;
      try {
        await fsUnsaveScholarship(user.uid, id);
        const scholarship = scholarships.find((s) => s.id === id);
        if (scholarship && user?.uid) {
          notifyScholarshipUnsaved(user.uid, scholarship.name);
        }
      } catch (err) {
        console.error('Failed to unsave scholarship:', err);
      }
    },
    [user?.uid, scholarships]
  );

  return {
    scholarships,
    savedScholarshipIds,
    isLoading,
    error,
    saveScholarship,
    unsaveScholarship,
  };
}
