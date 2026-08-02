import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  bookSearchResultToWatchlistItem,
  movieSearchResultToWatchlistItem,
} from './searchMappers.js';

describe('searchMappers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-21T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('maps a book search hit to a watchlist book item', () => {
    const item = bookSearchResultToWatchlistItem({
      id: 'works/OL1W',
      title: 'Dune',
      author: 'Frank Herbert',
      publishYear: 1965,
      genre: 'Science Fiction',
    });

    expect(item).toEqual({
      id: 'book-search-works/OL1W',
      type: 'book',
      title: 'Dune',
      author: 'Frank Herbert',
      publishYear: 1965,
      genre: 'Science Fiction',
      status: 'want',
      dateAdded: '2026-07-21',
    });
  });

  it('maps a movie search hit to a watchlist movie item', () => {
    const item = movieSearchResultToWatchlistItem({
      id: '438631',
      title: 'Dune',
      releaseYear: 2021,
      genre: 'Science Fiction',
    });

    expect(item).toEqual({
      id: 'movie-search-438631',
      type: 'movie',
      title: 'Dune',
      releaseYear: 2021,
      genre: 'Science Fiction',
      status: 'want',
      dateAdded: '2026-07-21',
    });
  });
});
