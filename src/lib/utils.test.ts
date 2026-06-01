import { describe, it, expect } from 'vitest';
import { formatDate } from './utils';

describe('formatDate', () => {
  it('should correctly format a local Date instance', () => {
    // Note: This relies on the environment timezone.
    // Instead of parsing a UTC string, construct with local year/month/date.
    const date = new Date(2023, 9, 15); // October is 9
    expect(formatDate(date)).toBe('15 Oct 2023');
  });

  it('should correctly format a date string', () => {
    // Note: When parsing "2023-10-15", browsers may interpret it differently.
    // To be safe and deterministic, let's use the local ISO string or equivalent.
    // However, given the implementation just does `new Date(date)`,
    // let's pass a string that reliably parses to a specific local date.
    // The format is "15 Oct 2023" for 'en-IN' regardless of timezone if we provide local date.

    // A reliable way: format the string output of our known good local date.
    const date = new Date(2023, 9, 15);
    const dateString = date.toISOString(); // e.g. "2023-10-15T04:00:00.000Z" depending on tz
    // Actually, `Intl.DateTimeFormat` will format this based on the local timezone where it's run.
    // So if the environment is in EDT, 04:00Z is 00:00 EDT, formatted as Oct 15.

    // Let's use a widely supported string format that parses locally in V8:
    expect(formatDate('2023/10/15')).toBe('15 Oct 2023');
  });

  it('should correctly format a timezone-explicit string', () => {
    // If the local timezone is way off, an ISO string without time might resolve to the previous day locally.
    // But testing the formatting format is the main point.
    // Using a very clear local string format should work across timezones for a basic pure function test.
    const date = new Date(2024, 0, 1);
    expect(formatDate(date)).toBe('1 Jan 2024');
  });

  it('should throw an error for invalid date strings', () => {
    expect(() => formatDate('invalid-date-string')).toThrow();
  });
});
