'use client';

/**
 * useScannedNotices — Real-time Firestore-backed scanned notices hook.
 *
 * Stores AI extraction results in Firestore so they persist across
 * sessions and can be displayed in the dashboard's "Recent Uploads" widget.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  onScannedNoticesSnapshot,
  addScannedNotice as fsAddNotice,
} from '@/lib/firestore';
import {
  notifyNoticeScanned,
  notifyAiTasksExtracted,
} from '@/lib/notificationService';
import type { ExtractionResult } from '@/types';

interface UseScannedNoticesReturn {
  notices: ExtractionResult[];
  isLoading: boolean;
  error: string | null;
  addNotice: (result: Omit<ExtractionResult, 'id'>) => Promise<string | null>;
}

export function useScannedNotices(): UseScannedNoticesReturn {
  const { user } = useAuth();
  const [notices, setNotices] = useState<ExtractionResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setNotices([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = onScannedNoticesSnapshot(
      user.uid,
      (updatedNotices) => {
        setNotices(updatedNotices);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Scanned notices listener error:', err);
        setError('Failed to load scanned notices');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const addNotice = useCallback(
    async (result: Omit<ExtractionResult, 'id'>): Promise<string | null> => {
      if (!user?.uid) return null;
      try {
        const id = await fsAddNotice(user.uid, result);
        if (id && user?.uid) {
          notifyNoticeScanned(user.uid, result.title);
          if (result.taskCards && result.taskCards.length > 0) {
            notifyAiTasksExtracted(
              user.uid,
              result.title,
              result.taskCards.length
            );
          }
        }
        return id;
      } catch (err) {
        console.error('Failed to save scanned notice:', err);
        setError('Failed to save notice');
        return null;
      }
    },
    [user?.uid]
  );

  return {
    notices,
    isLoading,
    error,
    addNotice,
  };
}
