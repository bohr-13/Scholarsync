import { renderHook, act } from '@testing-library/react';
import { useTodos } from '@/hooks/useTodos';
import { useAuth } from '@/components/providers/AuthProvider';
import { addTodoList as fsAddTodoList, onTodoListsSnapshot } from '@/lib/firestore';

// Mock dependencies
jest.mock('@/components/providers/AuthProvider');
jest.mock('@/lib/firestore');

const mockUseAuth = useAuth as jest.Mock;
const mockFsAddTodoList = fsAddTodoList as jest.Mock;
const mockOnTodoListsSnapshot = onTodoListsSnapshot as jest.Mock;

describe('useTodos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnTodoListsSnapshot.mockReturnValue(jest.fn()); // Mock unsubscribe
  });

  it('should handle error when createList fails', async () => {
    const mockUser = { uid: 'user-123' };
    mockUseAuth.mockReturnValue({ user: mockUser });

    // Mock the firestore addTodoList to throw an error
    const error = new Error('Firestore error');
    mockFsAddTodoList.mockRejectedValue(error);

    // Suppress console.error for this test as we expect an error to be logged
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useTodos());

    let createResult: string | null = null;
    await act(async () => {
      createResult = await result.current.createList('Test List');
    });

    expect(mockFsAddTodoList).toHaveBeenCalledTimes(1);
    expect(createResult).toBeNull();
    expect(result.current.error).toBe('Failed to create TODO list');
    expect(consoleSpy).toHaveBeenCalledWith('Failed to create todo list:', error);

    consoleSpy.mockRestore();
  });
});
