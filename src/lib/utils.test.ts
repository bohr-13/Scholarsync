import { describe, it, expect } from 'vitest';
import { getUrgencyBg } from './utils';

describe('getUrgencyBg', () => {
  it('returns correct classes for critical priority', () => {
    expect(getUrgencyBg('critical')).toBe('bg-rose-500/10 border-rose-500/20');
  });

  it('returns correct classes for high priority', () => {
    expect(getUrgencyBg('high')).toBe('bg-amber-500/10 border-amber-500/20');
  });

  it('returns correct classes for medium priority', () => {
    expect(getUrgencyBg('medium')).toBe('bg-blue-500/10 border-blue-500/20');
  });

  it('returns correct classes for low priority', () => {
    expect(getUrgencyBg('low')).toBe('bg-slate-500/10 border-slate-500/20');
  });

  it('returns default classes for unknown priority', () => {
    expect(getUrgencyBg('unknown')).toBe('bg-slate-500/10 border-slate-500/20');
  });

  it('returns default classes for empty priority', () => {
    expect(getUrgencyBg('')).toBe('bg-slate-500/10 border-slate-500/20');
  });
});
