import { describe, it, expect } from 'vitest';
import { getRiskColor } from './utils';

describe('getRiskColor', () => {
  it('should return correct color for danger', () => {
    expect(getRiskColor('danger')).toBe('text-rose-400');
  });

  it('should return correct color for warning', () => {
    expect(getRiskColor('warning')).toBe('text-amber-400');
  });

  it('should return correct color for safe', () => {
    expect(getRiskColor('safe')).toBe('text-emerald-400');
  });

  it('should return default color for unknown risk level', () => {
    expect(getRiskColor('unknown')).toBe('text-slate-400');
    expect(getRiskColor('')).toBe('text-slate-400');
    expect(getRiskColor('somethingelse')).toBe('text-slate-400');
  });
});
