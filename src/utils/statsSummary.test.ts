import { describe, expect, it } from 'vitest';
import { emptyWatchlist, mockWatchlist } from '../fixtures/mockWatchlist.js';
import { statsSummary } from './statsSummary.js';

describe('statsSummary', () => {
  it('computes total count, completion rate, and average rating', () => {
    const stats = statsSummary(mockWatchlist);

    expect(stats.totalCount).toBe(5);
    expect(stats.completionRate).toBeCloseTo(0.4);
    expect(stats.averageRating).toBeCloseTo(4.5);
  });

  it('returns safe defaults for an empty watchlist', () => {
    expect(statsSummary(emptyWatchlist)).toEqual({
      totalCount: 0,
      completionRate: 0,
      averageRating: null,
    });
  });
});
