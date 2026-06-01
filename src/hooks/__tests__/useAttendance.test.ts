import { renderHook, act } from '@testing-library/react';
import { useAttendance } from '../useAttendance';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  addAttendanceSubject as fsAddSubject,
  onAttendanceSnapshot
} from '@/lib/firestore';

// Mock dependencies
jest.mock('@/components/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/firestore', () => ({
  onAttendanceSnapshot: jest.fn(() => jest.fn()),
  addAttendanceSubject: jest.fn(),
  updateAttendanceSubject: jest.fn(),
  deleteAttendanceSubject: jest.fn(),
}));

describe('useAttendance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addSubject', () => {
    it('should add a subject successfully via fsAddSubject', async () => {
      // Setup mock user
      (useAuth as jest.Mock).mockReturnValue({
        user: { uid: 'test-user-123' },
      });

      (fsAddSubject as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAttendance());

      await act(async () => {
        await result.current.addSubject('Math', 'MATH101', 5, 10);
      });

      expect(fsAddSubject).toHaveBeenCalledWith('test-user-123', {
        name: 'Math',
        code: 'MATH101',
        attended: 5,
        total: 10,
      });

      expect(result.current.error).toBeNull();
    });

    it('should set an error when fsAddSubject fails', async () => {
      // Setup mock user
      (useAuth as jest.Mock).mockReturnValue({
        user: { uid: 'test-user-123' },
      });

      // Setup fsAddSubject to throw an error
      const mockError = new Error('Firestore error');
      (fsAddSubject as jest.Mock).mockRejectedValue(mockError);

      // We need to silence console.error for this test to keep output clean
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useAttendance());

      await act(async () => {
        await result.current.addSubject('Math', 'MATH101', 5, 10);
      });

      expect(fsAddSubject).toHaveBeenCalledWith('test-user-123', {
        name: 'Math',
        code: 'MATH101',
        attended: 5,
        total: 10,
      });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to add subject:', mockError);
      expect(result.current.error).toBe('Failed to add subject');

      consoleSpy.mockRestore();
    });

    it('should not call fsAddSubject if user is not logged in', async () => {
      // Setup mock user as null
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
      });

      const { result } = renderHook(() => useAttendance());

      await act(async () => {
        await result.current.addSubject('Math', 'MATH101', 5, 10);
      });

      expect(fsAddSubject).not.toHaveBeenCalled();
    });
  });
});
