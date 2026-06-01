import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { priorityScore } from './utils';

describe('priorityScore', () => {
  beforeEach(() => {
    // Set a fixed date for reliable testing of deadlines
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('base priority weights (with deadline far in future)', () => {
    // A deadline 30 days in the future will have 0 urgency boost
    const futureDeadline = '2024-01-31T12:00:00.000Z';

    it('returns 100 for critical priority', () => {
      expect(priorityScore({ priority: 'critical', deadline: futureDeadline })).toBe(100);
    });

    it('returns 75 for high priority', () => {
      expect(priorityScore({ priority: 'high', deadline: futureDeadline })).toBe(75);
    });

    it('returns 50 for medium priority', () => {
      expect(priorityScore({ priority: 'medium', deadline: futureDeadline })).toBe(50);
    });

    it('returns 25 for low priority', () => {
      expect(priorityScore({ priority: 'low', deadline: futureDeadline })).toBe(25);
    });

    it('returns 0 for unknown priority', () => {
      expect(priorityScore({ priority: 'unknown', deadline: futureDeadline })).toBe(0);
    });
  });

  describe('urgency boosts based on days left', () => {
    // Use low priority (25 base) so we can clearly see the added boost
    const priority = 'low'; // Base score: 25

    it('adds 50 boost when <= 1 day left', () => {
      // 1 day left: 2024-01-02T12:00:00.000Z
      expect(priorityScore({ priority, deadline: '2024-01-02T12:00:00.000Z' })).toBe(25 + 50);
      // 0.5 days left: 2024-01-02T00:00:00.000Z
      expect(priorityScore({ priority, deadline: '2024-01-02T00:00:00.000Z' })).toBe(25 + 50);
    });

    it('adds 30 boost when <= 3 days left (but > 1 day)', () => {
      // 2 days left: 2024-01-03T12:00:00.000Z
      expect(priorityScore({ priority, deadline: '2024-01-03T12:00:00.000Z' })).toBe(25 + 30);
      // 3 days left: 2024-01-04T12:00:00.000Z
      expect(priorityScore({ priority, deadline: '2024-01-04T12:00:00.000Z' })).toBe(25 + 30);
    });

    it('adds 10 boost when <= 7 days left (but > 3 days)', () => {
      // 4 days left: 2024-01-05T12:00:00.000Z
      expect(priorityScore({ priority, deadline: '2024-01-05T12:00:00.000Z' })).toBe(25 + 10);
      // 7 days left: 2024-01-08T12:00:00.000Z
      expect(priorityScore({ priority, deadline: '2024-01-08T12:00:00.000Z' })).toBe(25 + 10);
    });

    it('adds 0 boost when > 7 days left', () => {
      // 8 days left: 2024-01-09T12:00:00.000Z
      expect(priorityScore({ priority, deadline: '2024-01-09T12:00:00.000Z' })).toBe(25 + 0);
    });
  });

  describe('overdue tasks', () => {
    it('treats past deadlines as 0 days left (max urgency boost +50)', () => {
      // Past deadline: 2023-12-31T12:00:00.000Z
      expect(priorityScore({ priority: 'low', deadline: '2023-12-31T12:00:00.000Z' })).toBe(25 + 50);
    });
  });
});
