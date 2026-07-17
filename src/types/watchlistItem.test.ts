import { describe, expect, it } from 'vitest';
import { mockWatchlist } from '../fixtures/mockWatchlist.js';
import {
  hasRating,
  isBookItem,
  isMovieItem,
} from './watchlistItem.js';

describe('watchlistItem type guards', () => {
  it('isMovieItem returns true only for movie items', () => {
    const movie = mockWatchlist[0]!;
    const book = mockWatchlist[1]!;

    expect(isMovieItem(movie)).toBe(true);
    expect(isMovieItem(book)).toBe(false);
  });

  it('isBookItem returns true only for book items', () => {
    const movie = mockWatchlist[0]!;
    const book = mockWatchlist[1]!;

    expect(isBookItem(book)).toBe(true);
    expect(isBookItem(movie)).toBe(false);
  });

  it('hasRating returns true only when rating is defined', () => {
    const rated = mockWatchlist[0]!;
    const unrated = mockWatchlist[1]!;

    expect(hasRating(rated)).toBe(true);
    expect(hasRating(unrated)).toBe(false);
  });

  it('hasRating returns false for done items without a rating field', () => {
    const doneWithoutRating = {
      ...mockWatchlist[0]!,
      rating: undefined,
    };

    expect(hasRating(doneWithoutRating)).toBe(false);
  });
});
