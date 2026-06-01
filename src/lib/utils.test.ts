import { describe, it, expect } from 'vitest';
import { calculateAttendance } from './utils';

describe('calculateAttendance', () => {
  describe('riskLevel assignment', () => {
    it('should assign "safe" when percentage is 80% or higher', () => {
      // Exact boundary: 80%
      expect(calculateAttendance(80, 100).riskLevel).toBe('safe');
      // Above boundary: 85%
      expect(calculateAttendance(85, 100).riskLevel).toBe('safe');
      // Maximum: 100%
      expect(calculateAttendance(100, 100).riskLevel).toBe('safe');
    });

    it('should assign "warning" when percentage is between 75% (inclusive) and 80% (exclusive)', () => {
      // Exact boundary: 75%
      expect(calculateAttendance(75, 100).riskLevel).toBe('warning');
      // Between boundaries: 79%
      expect(calculateAttendance(79, 100).riskLevel).toBe('warning');
      // Fractional case: 79.9%
      expect(calculateAttendance(799, 1000).riskLevel).toBe('warning');
    });

    it('should assign "danger" when percentage is below 75%', () => {
      // Just below boundary: 74%
      expect(calculateAttendance(74, 100).riskLevel).toBe('danger');
      // Fractional below boundary: 74.9%
      expect(calculateAttendance(749, 1000).riskLevel).toBe('danger');
      // Low value: 50%
      expect(calculateAttendance(50, 100).riskLevel).toBe('danger');
      // Zero: 0%
      expect(calculateAttendance(0, 100).riskLevel).toBe('danger');
    });

    it('should handle edge cases and return "danger" when total classes is 0', () => {
      // Edge case: total = 0
      expect(calculateAttendance(0, 0).riskLevel).toBe('danger');
    });
  });
});
