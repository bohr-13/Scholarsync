import { describe, expect, test } from 'vitest';
import { getUrgencyColor } from './utils';

describe('getUrgencyColor', () => {
  test.each([
    ['critical', 'text-rose-400'],
    ['high', 'text-amber-400'],
    ['medium', 'text-blue-400'],
    ['low', 'text-slate-400'],
    ['unknown', 'text-slate-400'],
    ['', 'text-slate-400'],
  ])('for priority "%s", returns "%s"', (priority, expectedColor) => {
    expect(getUrgencyColor(priority)).toBe(expectedColor);
  });
});
