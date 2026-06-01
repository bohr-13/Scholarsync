import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useTasks } from './useTasks';
import * as AuthProvider from '@/components/providers/AuthProvider';
import * as firestore from '@/lib/firestore';

vi.mock('@/components/providers/AuthProvider', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/firestore', () => ({
  onTasksSnapshot: vi.fn(),
  addTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

describe('useTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('toggleTaskComplete', () => {
    it('bails out and does not call updateTask if task is undefined', async () => {
      vi.mocked(AuthProvider.useAuth).mockReturnValue({ user: { uid: 'test-user' } } as any);

      // Mock onTasksSnapshot to set some initial tasks
      vi.mocked(firestore.onTasksSnapshot).mockImplementation((uid, callback) => {
        // We pass an array containing only 'task1'
        callback([{ id: 'task1', title: 'Task 1', status: 'pending' } as any]);
        return vi.fn(); // Mock unsubscribe function
      });

      const { result } = renderHook(() => useTasks());

      // At this point, tasks should be [{ id: 'task1', ... }]
      expect(result.current.tasks).toHaveLength(1);

      // Act: Try to toggle a task that doesn't exist in the list
      await act(async () => {
        await result.current.toggleTaskComplete('non-existent-task');
      });

      // Assert: updateTask should not be called since the task was not found
      expect(firestore.updateTask).not.toHaveBeenCalled();
    });

    it('calls updateTask with correct parameters if task is found', async () => {
      vi.mocked(AuthProvider.useAuth).mockReturnValue({ user: { uid: 'test-user' } } as any);

      vi.mocked(firestore.onTasksSnapshot).mockImplementation((uid, callback) => {
        callback([{ id: 'task1', title: 'Task 1', status: 'pending' } as any]);
        return vi.fn();
      });

      const { result } = renderHook(() => useTasks());

      await act(async () => {
        await result.current.toggleTaskComplete('task1');
      });

      expect(firestore.updateTask).toHaveBeenCalledWith('test-user', 'task1', {
        status: 'completed',
        completedAt: expect.any(String),
      });
    });

    it('bails out if user is not authenticated', async () => {
      // Setup unauthenticated state
      vi.mocked(AuthProvider.useAuth).mockReturnValue({ user: null } as any);

      const { result } = renderHook(() => useTasks());

      await act(async () => {
        await result.current.toggleTaskComplete('task1');
      });

      expect(firestore.updateTask).not.toHaveBeenCalled();
    });
  });
});
