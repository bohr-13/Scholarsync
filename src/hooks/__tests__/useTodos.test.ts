import { renderHook, act } from '@testing-library/react';
import { useTodos } from '../useTodos';
import { useAuth } from '@/components/providers/AuthProvider';
import { updateTodoList as fsUpdateTodoList, onTodoListsSnapshot } from '@/lib/firestore';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';

// Mock dependencies
vi.mock('@/components/providers/AuthProvider', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/firestore', () => ({
  onTodoListsSnapshot: vi.fn(),
  addTodoList: vi.fn(),
  updateTodoList: vi.fn(),
  deleteTodoList: vi.fn(),
}));

describe('useTodos', () => {
  const mockUser = { uid: 'test-uid' };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as Mock).mockReturnValue({ user: mockUser });

    // Default implementation for snapshot
    (onTodoListsSnapshot as Mock).mockImplementation((uid, callback) => {
      // Don't call automatically to allow testing different states,
      // or call with empty list initially
      callback([]);
      return vi.fn(); // unsubscribe function
    });
  });

  it('deleteTask resets order of remaining tasks', async () => {
    const listId = 'list-1';

    // Set up mock initial data with 3 tasks
    const mockTasks = [
      { id: 'task-1', text: 'Task 1', completed: false, order: 0 },
      { id: 'task-2', text: 'Task 2', completed: false, order: 1 },
      { id: 'task-3', text: 'Task 3', completed: false, order: 2 },
    ];

    const mockLists = [
      { id: listId, tasks: mockTasks }
    ];

    (onTodoListsSnapshot as Mock).mockImplementation((uid, callback) => {
      callback(mockLists);
      return vi.fn();
    });

    const { result } = renderHook(() => useTodos());

    // Wait for the initial state to be populated
    expect(result.current.todoLists.length).toBe(1);
    expect(result.current.todoLists[0].tasks.length).toBe(3);

    // Delete the middle task
    await act(async () => {
      await result.current.deleteTask(listId, 'task-2');
    });

    // Check that fsUpdateTodoList was called with the correctly reordered tasks
    expect(fsUpdateTodoList).toHaveBeenCalledWith(mockUser.uid, listId, {
      tasks: [
        { id: 'task-1', text: 'Task 1', completed: false, order: 0 },
        { id: 'task-3', text: 'Task 3', completed: false, order: 1 },
      ]
    });
  });
});
