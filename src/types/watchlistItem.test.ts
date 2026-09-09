import { describe, expect, it } from 'vitest';
import { mockWatchlist } from '../fixtures/mockWatchlist.js';
import { applyWatchlistUpdate } from '../utils/applyWatchlistUpdate.js';
import {
  applyWatchlistItemUpdate,
  hasRating,
  isBookItem,
  isMovieItem,
} from './watchlistItem.js';

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

describe('applyWatchlistUpdate', () => {
  const ratedMovie = mockWatchlist[0]!;

  it('sets a rating on a done item', () => {
    expect(
      applyWatchlistUpdate(ratedMovie, { status: 'done', rating: 3 }).rating
    ).toBe(3);
    expect(
      applyWatchlistItemUpdate(ratedMovie, {
        status: 'done',
        rating: 3,
      }).rating
    ).toBe(3);
  });

  it('clears a rating when status is no longer done', () => {
    const updated = applyWatchlistUpdate(ratedMovie, {
      status: 'watching',
    });

    expect(updated.rating).toBeUndefined();
  });

  it('clears a rating when the form supplies null', () => {
    const updated = applyWatchlistUpdate(ratedMovie, {
      status: 'done',
      rating: null,
    });

    expect(updated.rating).toBeUndefined();
  });
});
