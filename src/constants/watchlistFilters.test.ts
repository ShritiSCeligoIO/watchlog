import { describe, expect, it } from 'vitest';
import { isStatusFilter, isTypeFilter } from './watchlistFilters.js';

describe('watchlist filter URL validation', () => {
  it('accepts supported type filters', () => {
    expect(isTypeFilter('all')).toBe(true);
    expect(isTypeFilter('movie')).toBe(true);
    expect(isTypeFilter('book')).toBe(true);
  });

  it('rejects missing and junk type filters', () => {
    expect(isTypeFilter(null)).toBe(false);
    expect(isTypeFilter('podcast')).toBe(false);
  });

  it('accepts supported status filters', () => {
    expect(isStatusFilter('all')).toBe(true);
    expect(isStatusFilter('want')).toBe(true);
    expect(isStatusFilter('watching')).toBe(true);
    expect(isStatusFilter('done')).toBe(true);
  });

  it('rejects missing and junk status filters', () => {
    expect(isStatusFilter(null)).toBe(false);
    expect(isStatusFilter('paused')).toBe(false);
  });
});
