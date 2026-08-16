import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('joins multiple class strings', () => {
    expect(cn('rounded-md', 'p-4')).toBe('rounded-md p-4');
  });

  it('keeps the last value when Tailwind utilities conflict', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('bg-primary', 'bg-destructive')).toBe('bg-destructive');
  });

  it('keeps utilities that do not conflict', () => {
    expect(cn('px-2', 'py-4')).toBe('px-2 py-4');
  });

  it('ignores falsy values', () => {
    expect(cn('p-4', false, null, undefined, '')).toBe('p-4');
  });

  it('applies conditional classes only when truthy', () => {
    expect(cn('border', { 'ring-2': true, 'opacity-50': false })).toBe('border ring-2');
  });

  it('flattens arrays of classes', () => {
    expect(cn(['flex', 'gap-2'], 'items-center')).toBe('flex gap-2 items-center');
  });

  it('returns an empty string when given no usable input', () => {
    expect(cn()).toBe('');
    expect(cn(undefined, false)).toBe('');
  });
});
