import { calculateAttendance } from '../utils';

describe('calculateAttendance', () => {
  it('should calculate basic attendance correctly', () => {
    const result = calculateAttendance(10, 10);
    expect(result.percentage).toBe(100);
    expect(result.classesNeededFor75).toBe(0);
    expect(result.safeBunks).toBe(3);
    expect(result.riskLevel).toBe('safe');
  });

  describe('safeBunks calculation', () => {
    it('should correctly calculate safe bunks for 100% attendance (10/10)', () => {
      // 10 attended / 10 total.
      // After 3 bunks, attended = 10, total = 13
      // 10 / 13 = 76.9%
      // After 4 bunks, attended = 10, total = 14
      // 10 / 14 = 71.4%
      // Thus, safe bunks = 3.
      const result = calculateAttendance(10, 10);
      expect(result.safeBunks).toBe(3);
    });

    it('should correctly calculate safe bunks when exactly at 75% (3/4)', () => {
      // 3 attended / 4 total. 75%.
      // After 1 bunk, attended = 3, total = 5
      // 3 / 5 = 60%
      // Safe bunks should be 0.
      const result = calculateAttendance(3, 4);
      expect(result.safeBunks).toBe(0);
    });

    it('should calculate 0 safe bunks when attendance is below 75%', () => {
      const result = calculateAttendance(1, 2);
      expect(result.safeBunks).toBe(0);
    });

    it('should correctly calculate safe bunks for hovering right around 75%', () => {
      // 16 attended / 20 total. 80%.
      // bunks:
      // 1 bunk: 16/21 = 76.19%
      // 2 bunks: 16/22 = 72.72%
      // safe bunks = 1
      const result = calculateAttendance(16, 20);
      expect(result.safeBunks).toBe(1);
    });

    it('should test a larger scale example to ensure no off-by-one errors', () => {
      // Let's test attended=76, total=100. Percentage=76%.
      // 76 / 101 = 75.2%
      // 76 / 102 = 74.5%
      // safe bunks = 1
      const result = calculateAttendance(76, 100);
      expect(result.safeBunks).toBe(1);
    });
  });

  describe('risk level', () => {
    it('should be safe for >= 80%', () => {
      const result = calculateAttendance(8, 10);
      expect(result.riskLevel).toBe('safe');
    });

    it('should be warning for >= 75% and < 80%', () => {
      const result = calculateAttendance(75, 100);
      expect(result.riskLevel).toBe('warning');
    });

    it('should be danger for < 75%', () => {
      const result = calculateAttendance(74, 100);
      expect(result.riskLevel).toBe('danger');
    });
  });

  describe('classesNeededFor75', () => {
    it('should be 0 when already >= 75%', () => {
      const result = calculateAttendance(75, 100);
      expect(result.classesNeededFor75).toBe(0);
    });

    it('should correctly calculate when below 75%', () => {
      // 5 attended out of 10 total (50%)
      // required: 75%
      // currently 50%
      // classesNeeded = Math.ceil((75 * 10 - 100 * 5) / (100 - 75))
      // classesNeeded = Math.ceil((750 - 500) / 25) = Math.ceil(250 / 25) = 10
      // Let's verify: 10 + 5 = 15 attended, 10 + 10 = 20 total
      // 15/20 = 75%.
      const result = calculateAttendance(5, 10);
      expect(result.classesNeededFor75).toBe(10);
    });
  });

  it('should handle total = 0 gracefully', () => {
    const result = calculateAttendance(0, 0);
    expect(result.percentage).toBe(0);
    expect(result.classesNeededFor75).toBe(0);
    expect(result.safeBunks).toBe(0);
    expect(result.riskLevel).toBe('danger');
  });
});
