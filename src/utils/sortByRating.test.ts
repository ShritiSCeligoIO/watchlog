import { describe, expect, it } from 'vitest';
import { mockWatchlist } from '../fixtures/mockWatchlist.js';
import { sortByRating } from './sortByRating.js';

describe('sortByRating', () => {
  it('sorts rated items highest-first by default and pushes unrated items to the end', () => {
    const sorted = sortByRating(mockWatchlist);

    expect(sorted[0]?.id).toBe('movie-1');
    expect(sorted[1]?.id).toBe('movie-2');
    expect(sorted.slice(2).every((item) => item.rating === undefined)).toBe(true);
  });

  it('sorts ascending when direction is asc', () => {
    const sorted = sortByRating(mockWatchlist, 'asc');

    expect(sorted[0]?.id).toBe('movie-2');
    expect(sorted[1]?.id).toBe('movie-1');
  });

  it('does not mutate the original array', () => {
    const copy = [...mockWatchlist];
    sortByRating(mockWatchlist);
    expect(mockWatchlist).toEqual(copy);
  });
});
