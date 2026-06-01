import { describe, it, expect } from 'vitest';
import { calculateAttendance } from './utils';

describe('calculateAttendance', () => {
  it('should handle high attendance (safe risk level)', () => {
    // 100% attendance
    const result1 = calculateAttendance(10, 10);
    expect(result1).toEqual({
      percentage: 100,
      safeBunks: 3, // Math.floor((10 - 7.5) / 0.75) = 3
      classesNeededFor75: 0,
      riskLevel: 'safe',
    });

    // 80% attendance
    const result2 = calculateAttendance(80, 100);
    expect(result2).toEqual({
      percentage: 80,
      safeBunks: 6, // Math.floor((80 - 75) / 0.75) = 6
      classesNeededFor75: 0,
      riskLevel: 'safe',
    });
  });

  it('should handle borderline attendance (warning risk level)', () => {
    // exactly 75% attendance
    const result = calculateAttendance(75, 100);
    expect(result).toEqual({
      percentage: 75,
      safeBunks: 0,
      classesNeededFor75: 0,
      riskLevel: 'warning',
    });
  });

  it('should handle low attendance (danger risk level)', () => {
    // 50% attendance
    const result = calculateAttendance(50, 100);
    expect(result).toEqual({
      percentage: 50,
      safeBunks: 0,
      classesNeededFor75: 100, // needs 100 more classes to reach 150/200 = 75%
      riskLevel: 'danger',
    });
  });

  it('should correctly round percentages to 1 decimal place', () => {
    // 2/3 = 66.666...
    const result = calculateAttendance(2, 3);
    expect(result.percentage).toBe(66.7);
    expect(result.riskLevel).toBe('danger');
  });

  it('should handle zero totals without returning NaN or Infinity', () => {
    // 0/0 edge case
    const result = calculateAttendance(0, 0);
    expect(result).toEqual({
      percentage: 0,
      safeBunks: 0,
      classesNeededFor75: 0,
      riskLevel: 'danger',
    });
  });

  it('should calculate classesNeededFor75 correctly for odd numbers', () => {
    // 10/20 = 50%
    // To reach 75%: (10 + C) / (20 + C) = 0.75
    // 10 + C = 15 + 0.75C
    // 0.25C = 5 => C = 20
    const result = calculateAttendance(10, 20);
    expect(result.classesNeededFor75).toBe(20);

    // 13/20 = 65%
    // To reach 75%: (13 + C) / (20 + C) = 0.75
    // 13 + C = 15 + 0.75C
    // 0.25C = 2 => C = 8
    const result2 = calculateAttendance(13, 20);
    expect(result2.classesNeededFor75).toBe(8);
  });
});
