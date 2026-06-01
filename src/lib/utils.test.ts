import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatRelativeDate } from './utils';

describe('formatRelativeDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('overdue logic (days < 0)', () => {
    it('returns "1d overdue" when date was yesterday', () => {
      const yesterday = new Date('2024-01-14T12:00:00.000Z');
      expect(formatRelativeDate(yesterday)).toBe('1d overdue');
    });

    it('returns "5d overdue" when date was 5 days ago', () => {
      const fiveDaysAgo = new Date('2024-01-10T12:00:00.000Z');
      expect(formatRelativeDate(fiveDaysAgo)).toBe('5d overdue');
    });

    it('returns correct value for string inputs', () => {
      expect(formatRelativeDate('2024-01-10T12:00:00.000Z')).toBe('5d overdue');
    });

    it('handles negative fractional days correctly (returns "Today" for past times within the same 24h window)', () => {
      // 1 hour ago
      const oneHourAgo = new Date('2024-01-15T11:00:00.000Z');
      expect(formatRelativeDate(oneHourAgo)).toBe('Today');
    });

    it('returns "1d overdue" if date is just over 24 hours ago', () => {
      // 25 hours ago
      const twentyFiveHoursAgo = new Date('2024-01-14T11:00:00.000Z');
      expect(formatRelativeDate(twentyFiveHoursAgo)).toBe('1d overdue');
    });
  });

  describe('future and present logic', () => {
    it('returns "Today" for exactly 0 days difference', () => {
      const today = new Date('2024-01-15T12:00:00.000Z');
      expect(formatRelativeDate(today)).toBe('Today');
    });

    it('returns "Tomorrow" for times later today (since Math.ceil rounds > 0 to 1)', () => {
      // 2 hours later
      const laterToday = new Date('2024-01-15T14:00:00.000Z');
      expect(formatRelativeDate(laterToday)).toBe('Tomorrow');
    });

    it('returns "Tomorrow" for exactly 24 hours later', () => {
      const tomorrow = new Date('2024-01-16T12:00:00.000Z');
      expect(formatRelativeDate(tomorrow)).toBe('Tomorrow');
    });

    it('returns "5 days left" for exactly 5 days later', () => {
      const fiveDaysLater = new Date('2024-01-20T12:00:00.000Z');
      expect(formatRelativeDate(fiveDaysLater)).toBe('5 days left');
    });

    it('returns "7 days left" for exactly 7 days later', () => {
      const sevenDaysLater = new Date('2024-01-22T12:00:00.000Z');
      expect(formatRelativeDate(sevenDaysLater)).toBe('7 days left');
    });

    it('returns formatted date for more than 7 days later', () => {
      const eightDaysLater = new Date('2024-01-23T12:00:00.000Z');
      expect(formatRelativeDate(eightDaysLater)).toMatch(/23 Jan 2024/i);
    });
  });
});
