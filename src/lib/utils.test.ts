import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatRelativeDate, formatDate } from './utils';

describe('formatRelativeDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-10T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Today" when days difference is 0', () => {
    const today = new Date('2024-01-10T12:00:00Z');
    expect(formatRelativeDate(today)).toBe('Today');
  });

  it('returns "Tomorrow" when days difference is 1', () => {
    const tomorrow = new Date('2024-01-11T12:00:00Z');
    expect(formatRelativeDate(tomorrow)).toBe('Tomorrow');
  });

  it('returns "7 days left" when exactly 7 days difference', () => {
    const inSevenDays = new Date('2024-01-17T12:00:00Z');
    expect(formatRelativeDate(inSevenDays)).toBe('7 days left');
  });

  it('returns formatted date when more than 7 days difference', () => {
    const inEightDays = new Date('2024-01-18T12:00:00Z');
    expect(formatRelativeDate(inEightDays)).toBe(formatDate(inEightDays));
  });

  it('returns "1d overdue" when overdue by 1 day', () => {
    const yesterday = new Date('2024-01-09T12:00:00Z');
    expect(formatRelativeDate(yesterday)).toBe('1d overdue');
  });

  it('returns "Today" when difference is slightly negative but rounds up to 0', () => {
    const fewHoursAgo = new Date('2024-01-10T08:00:00Z'); // -4 hours
    expect(formatRelativeDate(fewHoursAgo)).toBe('Today');
  });

  it('returns "Tomorrow" when difference is slightly positive and rounds up to 1', () => {
    const fewHoursLater = new Date('2024-01-10T16:00:00Z'); // +4 hours
    expect(formatRelativeDate(fewHoursLater)).toBe('Tomorrow');
  });
});
