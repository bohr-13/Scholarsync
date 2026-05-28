'use client';

/**
 * useAttendance — Real-time Firestore-backed attendance hook.
 *
 * Replaces the old in-memory-only hook. All add/update/remove operations
 * persist to Firestore, and the hook subscribes to real-time updates
 * so changes reflect instantly across all components.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  onAttendanceSnapshot,
  addAttendanceSubject as fsAddSubject,
  updateAttendanceSubject as fsUpdateSubject,
  deleteAttendanceSubject as fsDeleteSubject,
} from '@/lib/firestore';
import type { SubjectAttendance } from '@/types';

interface UseAttendanceReturn {
  subjects: SubjectAttendance[];
  isLoading: boolean;
  error: string | null;
  updateSubject: (id: string, attended: number, total: number) => Promise<void>;
  addSubject: (name: string, code: string, attended: number, total: number) => Promise<void>;
  removeSubject: (id: string) => Promise<void>;
  averageAttendance: number;
  atRiskCount: number;
}

export function useAttendance(): UseAttendanceReturn {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<SubjectAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to real-time Firestore attendance updates
  useEffect(() => {
    if (!user?.uid) {
      setSubjects([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = onAttendanceSnapshot(
      user.uid,
      (updatedSubjects) => {
        setSubjects(updatedSubjects);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Attendance listener error:', err);
        setError('Failed to load attendance data');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const updateSubject = useCallback(
    async (id: string, attended: number, total: number): Promise<void> => {
      if (!user?.uid) return;
      try {
        await fsUpdateSubject(user.uid, id, attended, total);
      } catch (err) {
        console.error('Failed to update subject:', err);
        setError('Failed to update attendance');
      }
    },
    [user?.uid]
  );

  const addSubject = useCallback(
    async (name: string, code: string, attended: number, total: number): Promise<void> => {
      if (!user?.uid) return;
      try {
        await fsAddSubject(user.uid, { name, code, attended, total });
      } catch (err) {
        console.error('Failed to add subject:', err);
        setError('Failed to add subject');
      }
    },
    [user?.uid]
  );

  const removeSubject = useCallback(
    async (id: string): Promise<void> => {
      if (!user?.uid) return;
      try {
        await fsDeleteSubject(user.uid, id);
      } catch (err) {
        console.error('Failed to remove subject:', err);
        setError('Failed to remove subject');
      }
    },
    [user?.uid]
  );

  // Computed values from the real-time data
  const averageAttendance =
    subjects.length > 0
      ? Math.round(
          (subjects.reduce((sum, s) => sum + s.percentage, 0) / subjects.length) * 10
        ) / 10
      : 0;

  const atRiskCount = subjects.filter((s) => s.riskLevel !== 'safe').length;

  return {
    subjects,
    isLoading,
    error,
    updateSubject,
    addSubject,
    removeSubject,
    averageAttendance,
    atRiskCount,
  };
}
