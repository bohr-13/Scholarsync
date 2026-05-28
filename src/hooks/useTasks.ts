'use client';

/**
 * useTasks — Real-time Firestore-backed tasks hook.
 *
 * Subscribes to the authenticated user's tasks collection in Firestore
 * and provides CRUD operations. Data persists across refreshes.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  onTasksSnapshot,
  addTask as fsAddTask,
  updateTask as fsUpdateTask,
  deleteTask as fsDeleteTask,
} from '@/lib/firestore';
import type { Task } from '@/types';

interface UseTasksReturn {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  addTask: (task: Omit<Task, 'id'>) => Promise<string | null>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskComplete: (taskId: string) => Promise<void>;
}

export function useTasks(): UseTasksReturn {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to real-time Firestore task updates
  useEffect(() => {
    if (!user?.uid) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = onTasksSnapshot(
      user.uid,
      (updatedTasks) => {
        setTasks(updatedTasks);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Tasks listener error:', err);
        setError('Failed to load tasks');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const addTask = useCallback(
    async (task: Omit<Task, 'id'>): Promise<string | null> => {
      if (!user?.uid) return null;
      try {
        const id = await fsAddTask(user.uid, task);
        return id;
      } catch (err) {
        console.error('Failed to add task:', err);
        setError('Failed to add task');
        return null;
      }
    },
    [user?.uid]
  );

  const updateTask = useCallback(
    async (taskId: string, updates: Partial<Task>): Promise<void> => {
      if (!user?.uid) return;
      try {
        await fsUpdateTask(user.uid, taskId, updates);
      } catch (err) {
        console.error('Failed to update task:', err);
        setError('Failed to update task');
      }
    },
    [user?.uid]
  );

  const deleteTask = useCallback(
    async (taskId: string): Promise<void> => {
      if (!user?.uid) return;
      try {
        await fsDeleteTask(user.uid, taskId);
      } catch (err) {
        console.error('Failed to delete task:', err);
        setError('Failed to delete task');
      }
    },
    [user?.uid]
  );

  // Toggle a task between completed and pending
  const toggleTaskComplete = useCallback(
    async (taskId: string): Promise<void> => {
      if (!user?.uid) return;
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      const isCompleted = task.status === 'completed';
      await updateTask(taskId, {
        status: isCompleted ? 'pending' : 'completed',
        completedAt: isCompleted ? undefined : new Date().toISOString(),
      });
    },
    [user?.uid, tasks, updateTask]
  );

  return {
    tasks,
    isLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
  };
}
