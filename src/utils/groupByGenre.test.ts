import { describe, expect, it } from 'vitest';
import { mockWatchlist } from '../fixtures/mockWatchlist.js';
import { groupByGenre } from './groupByGenre.js';

describe('groupByGenre', () => {
  it('groups items by genre and preserves item order', () => {
    const groups = groupByGenre(mockWatchlist);

    expect(groups['Science Fiction']?.map((item) => item.id)).toEqual([
      'movie-1',
      'book-1',
      'book-2',
    ]);
    expect(groups['Comedy']?.[0]?.id).toBe('movie-2');
    expect(groups['Thriller']?.[0]?.id).toBe('movie-3');
  });

  it('returns an empty object for an empty watchlist', () => {
    expect(groupByGenre([])).toEqual({});
  });

  it('does not mutate the input array', () => {
    const originalOrder = mockWatchlist.map((item) => item.id);

    groupByGenre(mockWatchlist);

    expect(mockWatchlist.map((item) => item.id)).toEqual(originalOrder);
  });
});
