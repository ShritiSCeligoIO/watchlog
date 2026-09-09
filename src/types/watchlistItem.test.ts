import { mockWatchlist } from '../fixtures/mockWatchlist.js';
import {
  hasRating,
  isBookItem,
  isMovieItem,
  type WatchlistItem,
} from './watchlistItem.js';

describe('watchlist item guards', () => {
  const movie = mockWatchlist[0]!;
  const book = mockWatchlist[1]!;

  it('narrows movies and books', () => {
    expect(isMovieItem(movie)).toBe(true);
    expect(isMovieItem(book)).toBe(false);
    expect(isBookItem(book)).toBe(true);
    expect(isBookItem(movie)).toBe(false);
  });

  it('requires a defined rating', () => {
    expect(hasRating(movie)).toBe(true);
    expect(hasRating(book)).toBe(false);

    // Runtime data can violate exactOptionalPropertyTypes at an API boundary.
    const explicitUndefined = {
      ...movie,
      rating: undefined,
    } as unknown as WatchlistItem;
    expect(hasRating(explicitUndefined)).toBe(false);
  });
});
