import { describe, expect, it } from 'vitest';
import type { WatchlistItem } from '../types/watchlistItem.js';
import { mockWatchlist } from '../fixtures/mockWatchlist.js';
import { statsSummary } from './statsSummary.js';

describe('statsSummary', () => {
  it('calculates count, completion rate, and average rating', () => {
    expect(statsSummary(mockWatchlist)).toEqual({
      totalCount: 5,
      completionRate: 0.4,
      averageRating: 4.5,
    });
  });

  it('returns safe values for an empty watchlist', () => {
    expect(statsSummary([])).toEqual({
      totalCount: 0,
      completionRate: 0,
      averageRating: null,
    });
  });

  it('ignores unrated done items when averaging ratings', () => {
    const items: WatchlistItem[] = [
      { ...mockWatchlist[0]!, rating: 4 },
      {
        id: 'movie-unrated',
        type: 'movie',
        title: 'Unrated Movie',
        genre: 'Drama',
        status: 'done',
        dateAdded: '2026-04-01',
      },
    ];

    expect(statsSummary(items)).toEqual({
      totalCount: 2,
      completionRate: 1,
      averageRating: 4,
    });
  });

  it('ignores ratings on items that are not done', () => {
    const items: WatchlistItem[] = [
      { ...mockWatchlist[1]!, rating: 5 },
      { ...mockWatchlist[2]!, rating: 2 },
    ];

    expect(statsSummary(items).averageRating).toBe(2);
  });
});
