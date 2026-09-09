import { describe, expect, it } from 'vitest';
import { formatDate, formatDecimal, formatPercent } from './format.js';

describe('locale formatters', () => {
  it('formats decimal and percent values for English and Spanish', () => {
    expect(formatDecimal(4.5, 'en')).toBe('4.5');
    expect(formatDecimal(4.5, 'es')).toBe('4,5');
    expect(formatPercent(0.5, 'en')).toBe('50%');
    expect(formatPercent(0.5, 'es')).toMatch(/^50\s?%$/);
  });

  it('formats valid dates and preserves invalid input', () => {
    expect(formatDate('2026-01-10', 'en')).toContain('January');
    expect(formatDate('2026-01-10', 'es')).toContain('enero');
    expect(formatDate('not-a-date', 'en')).toBe('not-a-date');
  });
});
