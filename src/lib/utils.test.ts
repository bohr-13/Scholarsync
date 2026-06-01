import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { priorityScore } from './utils';

describe('priorityScore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('priority weights', () => {
    it('returns correct score for critical priority (> 7 days left)', () => {
      expect(priorityScore({ priority: 'critical', deadline: '2024-01-10T00:00:00Z' })).toBe(100);
    });

    it('returns correct score for high priority (> 7 days left)', () => {
      expect(priorityScore({ priority: 'high', deadline: '2024-01-10T00:00:00Z' })).toBe(75);
    });

    it('returns correct score for medium priority (> 7 days left)', () => {
      expect(priorityScore({ priority: 'medium', deadline: '2024-01-10T00:00:00Z' })).toBe(50);
    });

    it('returns correct score for low priority (> 7 days left)', () => {
      expect(priorityScore({ priority: 'low', deadline: '2024-01-10T00:00:00Z' })).toBe(25);
    });

    it('returns correct score for unknown priority (> 7 days left)', () => {
      expect(priorityScore({ priority: 'unknown', deadline: '2024-01-10T00:00:00Z' })).toBe(0);
    });
  });

  describe('urgency boost edge cases', () => {
    it('adds 0 boost for > 7 days left', () => {
      // 8 days left
      expect(priorityScore({ priority: 'low', deadline: '2024-01-09T00:00:00Z' })).toBe(25 + 0);
    });

    it('adds 10 boost for exactly 7 days left', () => {
      // 7 days left
      expect(priorityScore({ priority: 'low', deadline: '2024-01-08T00:00:00Z' })).toBe(25 + 10);
    });

    it('adds 10 boost for between 3 and 7 days left', () => {
      // 5 days left
      expect(priorityScore({ priority: 'low', deadline: '2024-01-06T00:00:00Z' })).toBe(25 + 10);
    });

    it('adds 30 boost for exactly 3 days left', () => {
      // 3 days left
      expect(priorityScore({ priority: 'low', deadline: '2024-01-04T00:00:00Z' })).toBe(25 + 30);
    });

    it('adds 30 boost for between 1 and 3 days left', () => {
      // 2 days left
      expect(priorityScore({ priority: 'low', deadline: '2024-01-03T00:00:00Z' })).toBe(25 + 30);
    });

    it('adds 50 boost for exactly 1 day left', () => {
      // 1 day left
      expect(priorityScore({ priority: 'low', deadline: '2024-01-02T00:00:00Z' })).toBe(25 + 50);
    });

    it('adds 50 boost for < 1 day left', () => {
      // 0.5 days left
      expect(priorityScore({ priority: 'low', deadline: '2024-01-01T12:00:00Z' })).toBe(25 + 50);
    });

    it('adds 50 boost for negative days left (overdue)', () => {
      // -1 day left
      expect(priorityScore({ priority: 'low', deadline: '2023-12-31T00:00:00Z' })).toBe(25 + 50);
    });
  });
});
