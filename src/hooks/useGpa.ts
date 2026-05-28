'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { onGpaStateSnapshot, saveGpaState } from '@/lib/firestore';
import type { GpaState, GpaSubject } from '@/types';

interface UseGpaReturn {
  gpaState: GpaState | null;
  isLoading: boolean;
  error: string | null;
  updateGpaState: (updates: Partial<GpaState>) => Promise<void>;
}

export function useGpa(): UseGpaReturn {
  const { user } = useAuth();
  const [gpaState, setGpaState] = useState<GpaState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setGpaState(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = onGpaStateSnapshot(
      user.uid,
      (data) => {
        setGpaState(data as GpaState | null);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('GPA listener error:', err);
        setError('Failed to load GPA state');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const updateGpaState = useCallback(
    async (updates: Partial<GpaState>): Promise<void> => {
      if (!user?.uid) return;
      try {
        const newState = { ...(gpaState || {}), ...updates } as GpaState;
        // Optimistic update
        setGpaState(newState);
        await saveGpaState(user.uid, newState);
      } catch (err) {
        console.error('Failed to save GPA state:', err);
        setError('Failed to save GPA state');
      }
    },
    [user?.uid, gpaState]
  );

  return {
    gpaState,
    isLoading,
    error,
    updateGpaState,
  };
}
