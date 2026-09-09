import { describe, expect, it } from 'vitest';
import { mockWatchlist } from '../fixtures/mockWatchlist.js';
import { filterWatchlistItems } from './filterWatchlistItems.js';

describe('filterWatchlistItems', () => {
  it('returns all items when filters are all', () => {
    expect(filterWatchlistItems(mockWatchlist, 'all', 'all')).toHaveLength(
      mockWatchlist.length
    );
  });

  it('filters by type', () => {
    const movies = filterWatchlistItems(mockWatchlist, 'movie', 'all');
    expect(movies.every((item) => item.type === 'movie')).toBe(true);
    expect(movies.length).toBeGreaterThan(0);
  });

  it('filters by status', () => {
    const done = filterWatchlistItems(mockWatchlist, 'all', 'done');
    expect(done.every((item) => item.status === 'done')).toBe(true);
  });

  it('combines type and status filters', () => {
    const result = filterWatchlistItems(mockWatchlist, 'book', 'want');
    expect(
      result.every((item) => item.type === 'book' && item.status === 'want')
    ).toBe(true);
  });
});
