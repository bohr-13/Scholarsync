import { renderHook, act } from '@testing-library/react';
import { useTodos } from './useTodos';
import { useAuth } from '@/components/providers/AuthProvider';
import { updateTodoList as fsUpdateTodoList, onTodoListsSnapshot } from '@/lib/firestore';

jest.mock('@/components/providers/AuthProvider');
jest.mock('@/lib/firestore');

describe('useTodos reorderTasks error handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (onTodoListsSnapshot as jest.Mock).mockImplementation((uid, onNext) => {
      onNext([]);
      return jest.fn(); // unsubscribe function
    });
  });

  it('sets error state when fsUpdateTodoList fails during reorderTasks', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { uid: 'test-user-id' } });
    const mockUpdateTodoList = fsUpdateTodoList as jest.Mock;

    mockUpdateTodoList.mockRejectedValue(new Error('Firestore update failed'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useTodos());

    await act(async () => {
      await result.current.reorderTasks('list-1', [
        { id: 'task-1', text: 'test', completed: false, order: 0, createdAt: '', updatedAt: '' }
      ]);
    });

    expect(mockUpdateTodoList).toHaveBeenCalledWith('test-user-id', 'list-1', expect.objectContaining({
      tasks: expect.any(Array)
    }));

    expect(result.current.error).toBe('Failed to save tasks order');

    consoleSpy.mockRestore();
  });
});
