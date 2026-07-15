import { describe, expect, it } from 'vitest';
import { mockWatchlist } from '../fixtures/mockWatchlist.js';
import { filterByStatus } from './filterByStatus.js';

describe('filterByStatus', () => {
  it('returns only items with the requested status', () => {
    const done = filterByStatus(mockWatchlist, 'done');

    expect(done).toHaveLength(2);
    expect(done.every((item) => item.status === 'done')).toBe(true);
    expect(done.map((item) => item.id)).toEqual(['movie-1', 'movie-2']);
  });

  it('returns an empty array when no items match', () => {
    expect(filterByStatus([], 'want')).toEqual([]);
  });

  it('returns items with the requested status when the status is "want"', () => {
    const want = filterByStatus(mockWatchlist, 'want');
    expect(want).toHaveLength(2);
    expect(want.every((item) => item.status === 'want')).toBe(true);
    expect(want.map((item) => item.id)).toEqual(['book-2', 'movie-3']);
  });
});
