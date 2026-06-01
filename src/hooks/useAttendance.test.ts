import { renderHook, act } from '@testing-library/react';
import { useAttendance } from './useAttendance';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@/components/providers/AuthProvider', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/firestore', () => ({
  onAttendanceSnapshot: vi.fn(),
  addAttendanceSubject: vi.fn(),
  updateAttendanceSubject: vi.fn(),
  deleteAttendanceSubject: vi.fn(),
}));

import { useAuth } from '@/components/providers/AuthProvider';
import { updateAttendanceSubject, onAttendanceSnapshot } from '@/lib/firestore';

describe('useAttendance', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default setup for onAttendanceSnapshot to immediately call the success callback with empty array
    (onAttendanceSnapshot as any).mockImplementation((uid: string, onNext: Function) => {
      onNext([]);
      return vi.fn(); // return unsubscribe fn
    });
  });

  it('sets error state when updateSubject fails', async () => {
    // 1. Arrange
    const mockUser = { uid: 'test-user-123' };
    (useAuth as any).mockReturnValue({ user: mockUser });

    // Mock updateAttendanceSubject to throw an error
    const mockError = new Error('Firestore error');
    (updateAttendanceSubject as any).mockRejectedValueOnce(mockError);

    // Suppress console.error during this test expected error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // 2. Act
    const { result } = renderHook(() => useAttendance());

    // Call updateSubject
    await act(async () => {
      await result.current.updateSubject('subject-1', 5, 10);
    });

    // 3. Assert
    expect(updateAttendanceSubject).toHaveBeenCalledWith(mockUser.uid, 'subject-1', 5, 10);
    expect(result.current.error).toBe('Failed to update attendance');

    // Cleanup
    consoleErrorSpy.mockRestore();
  });
});
