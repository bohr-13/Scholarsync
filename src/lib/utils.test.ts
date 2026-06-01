import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility function', () => {
  it('should merge basic strings', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should handle conditional classes using objects', () => {
    expect(cn('class1', { class2: true, class3: false })).toBe('class1 class2');
  });

  it('should handle conditional classes using logical operators (falsy values)', () => {
    expect(cn('class1', false && 'class2', null, undefined, 0, '')).toBe('class1');
    expect(cn('class1', true && 'class2')).toBe('class1 class2');
  });

  it('should handle arrays of classes', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2');
    expect(cn(['class1', { class2: true }])).toBe('class1 class2');
  });

  it('should resolve Tailwind CSS conflicts', () => {
    // Tailwind's twMerge should override the earlier padding class
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    expect(cn('text-sm', 'text-lg')).toBe('text-lg');
  });

  it('should merge Tailwind classes and custom classes', () => {
    expect(cn('custom-class p-4', 'p-2')).toBe('custom-class p-2');
  });
});
