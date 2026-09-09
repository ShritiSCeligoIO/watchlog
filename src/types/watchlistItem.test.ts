import { describe, expect, it } from 'vitest';
import { mockWatchlist } from '../fixtures/mockWatchlist.js';
import { hasRating, isBookItem, isMovieItem } from './watchlistItem.js';

describe('watchlist item type guards', () => {
  const movie = mockWatchlist[0]!;
  const book = mockWatchlist[1]!;

  it('identifies movie items', () => {
    expect(isMovieItem(movie)).toBe(true);
    expect(isMovieItem(book)).toBe(false);
  });

  it('identifies book items', () => {
    expect(isBookItem(book)).toBe(true);
    expect(isBookItem(movie)).toBe(false);
  });

  it('identifies items with a rating', () => {
    expect(hasRating(movie)).toBe(true);
    expect(hasRating(book)).toBe(false);
  });
});
