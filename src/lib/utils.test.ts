import { describe, it, expect } from 'vitest';
import { calculateAttendance } from './utils';

describe('calculateAttendance', () => {
  it('should handle division by zero edge case when total is 0', () => {
    const result = calculateAttendance(0, 0);

    // According to calculateAttendance:
    // percentage = total > 0 ? ... : 0 => 0
    // riskLevel for percentage < 75 => 'danger'
    // classesNeededFor75 = Math.ceil((75 * 0 - 100 * 0) / (100 - 75)) => 0
    // safeBunks = percentage >= 75 ? ... : 0 => 0

    expect(result).toEqual({
      percentage: 0,
      safeBunks: 0,
      classesNeededFor75: 0,
      riskLevel: 'danger',
    });
  });

  it('should return correct values for a safe attendance', () => {
    // 80/100 = 80% -> safe
    const result = calculateAttendance(80, 100);
    expect(result.percentage).toBe(80);
    expect(result.riskLevel).toBe('safe');
    expect(result.classesNeededFor75).toBe(0);
    expect(result.safeBunks).toBeGreaterThan(0);
  });

  it('should return correct values for a warning attendance', () => {
    // 76/100 = 76% -> warning
    const result = calculateAttendance(76, 100);
    expect(result.percentage).toBe(76);
    expect(result.riskLevel).toBe('warning');
    expect(result.classesNeededFor75).toBe(0);
  });

  it('should return correct values for a danger attendance', () => {
    // 50/100 = 50% -> danger
    const result = calculateAttendance(50, 100);
    expect(result.percentage).toBe(50);
    expect(result.riskLevel).toBe('danger');
    expect(result.classesNeededFor75).toBeGreaterThan(0);
    expect(result.safeBunks).toBe(0);
  });
});
