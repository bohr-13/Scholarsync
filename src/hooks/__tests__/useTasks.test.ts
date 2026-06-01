import { renderHook, act } from '@testing-library/react';
import { useTasks } from '../useTasks';
import { useAuth } from '@/components/providers/AuthProvider';
import { addTask as fsAddTask, onTasksSnapshot } from '@/lib/firestore';

jest.mock('@/components/providers/AuthProvider');
jest.mock('@/lib/firestore');

describe('useTasks', () => {
  const mockUser = { uid: 'test-uid' };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (onTasksSnapshot as jest.Mock).mockImplementation((uid, onNext) => {
      onNext([]);
      return jest.fn();
    });
  });

  it('addTask error handling: returns null and sets error when fsAddTask fails', async () => {
    const mockError = new Error('Firestore error');
    (fsAddTask as jest.Mock).mockRejectedValueOnce(mockError);

    // Silence console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useTasks());

    const newTask = {
      title: 'Test Task',
      priority: 'high' as const,
      category: 'work' as const,
      status: 'pending' as const,
      source: 'test',
      createdAt: new Date().toISOString()
    };

    let taskId;
    await act(async () => {
      taskId = await result.current.addTask(newTask);
    });

    expect(fsAddTask).toHaveBeenCalledWith('test-uid', newTask);
    expect(consoleSpy).toHaveBeenCalledWith('Failed to add task:', mockError);
    expect(taskId).toBeNull();
    expect(result.current.error).toBe('Failed to add task');

    consoleSpy.mockRestore();
  });


  it('addTask success: returns task id when fsAddTask succeeds', async () => {
    (fsAddTask as jest.Mock).mockResolvedValueOnce('new-task-id');

    const { result } = renderHook(() => useTasks());

    const newTask = {
      title: 'Test Task',
      priority: 'high' as const,
      category: 'work' as const,
      status: 'pending' as const,
      source: 'test',
      createdAt: new Date().toISOString()
    };

    let taskId;
    await act(async () => {
      taskId = await result.current.addTask(newTask);
    });

    expect(fsAddTask).toHaveBeenCalledWith('test-uid', newTask);
    expect(taskId).toBe('new-task-id');
    expect(result.current.error).toBeNull();
  });

  it('addTask empty user: returns null and does not call fsAddTask if user is null', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });

    const { result } = renderHook(() => useTasks());

    const newTask = {
      title: 'Test Task',
      priority: 'high' as const,
      category: 'work' as const,
      status: 'pending' as const,
      source: 'test',
      createdAt: new Date().toISOString()
    };

    let taskId;
    await act(async () => {
      taskId = await result.current.addTask(newTask);
    });

    expect(fsAddTask).not.toHaveBeenCalled();
    expect(taskId).toBeNull();
  });
});
