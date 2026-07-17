import { describe, expect, it } from 'vitest';
import type { WatchlistItem } from '../types/watchlistItem.js';
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

  it('returns averageRating 3 when only one rated done item exists', () => {
    const items: WatchlistItem[] = [
      {
        id: 'movie-test-1',
        type: 'movie',
        title: 'Test Movie',
        genre: 'Drama',
        status: 'done',
        dateAdded: '2026-07-16',
        rating: 3,
      },
    ];

    const stats = statsSummary(items);

    expect(stats.totalCount).toBe(1);
    expect(stats.completionRate).toBe(1);
    expect(stats.averageRating).toBe(3);
  });

  it('returns completionRate 0 when no items are done', () => {
    const items: WatchlistItem[] = [
      {
        id: 'book-1',
        type: 'book',
        title: 'Project Hail Mary',
        genre: 'Science Fiction',
        status: 'watching',
        dateAdded: '2026-02-01',
      },
      {
        id: 'book-2',
        type: 'book',
        title: 'Dune',
        genre: 'Science Fiction',
        status: 'want',
        dateAdded: '2026-03-05',
      },
    ];

    const stats = statsSummary(items);

    expect(stats.totalCount).toBe(2);
    expect(stats.completionRate).toBe(0);
    expect(stats.averageRating).toBe(null);
  });

  it('returns averageRating null when no items have ratings', () => {
    const items: WatchlistItem[] = [
      {
        id: 'movie-3',
        type: 'movie',
        title: 'Parasite',
        genre: 'Thriller',
        status: 'done',
        dateAdded: '2026-03-12',
      },
    ];

    const stats = statsSummary(items);

    expect(stats.completionRate).toBe(1);
    expect(stats.averageRating).toBe(null);
  });

  it('returns completionRate 1 when every item is done', () => {
    const items: WatchlistItem[] = [
      {
        id: 'movie-1',
        type: 'movie',
        title: 'Arrival',
        genre: 'Science Fiction',
        status: 'done',
        dateAdded: '2026-01-10',
        rating: 5,
      },
      {
        id: 'movie-2',
        type: 'movie',
        title: 'The Grand Budapest Hotel',
        genre: 'Comedy',
        status: 'done',
        dateAdded: '2026-01-20',
        rating: 1,
      },
    ];

    const stats = statsSummary(items);

    expect(stats.totalCount).toBe(2);
    expect(stats.completionRate).toBe(1);
    expect(stats.averageRating).toBe(3);
  });

  it('includes rated items in average even when other done items are unrated', () => {
    const items: WatchlistItem[] = [
      {
        id: 'movie-1',
        type: 'movie',
        title: 'Arrival',
        genre: 'Science Fiction',
        status: 'done',
        dateAdded: '2026-01-10',
        rating: 4,
      },
      {
        id: 'movie-3',
        type: 'movie',
        title: 'Parasite',
        genre: 'Thriller',
        status: 'done',
        dateAdded: '2026-03-12',
      },
    ];

    const stats = statsSummary(items);

    expect(stats.completionRate).toBe(1);
    expect(stats.averageRating).toBe(4);
  });

  it('ignores ratings on non-done items when computing averageRating', () => {
    const items: WatchlistItem[] = [
      {
        id: 'book-1',
        type: 'book',
        title: 'Project Hail Mary',
        genre: 'Science Fiction',
        status: 'watching',
        dateAdded: '2026-02-01',
        rating: 5,
      },
      {
        id: 'movie-2',
        type: 'movie',
        title: 'The Grand Budapest Hotel',
        genre: 'Comedy',
        status: 'done',
        dateAdded: '2026-01-20',
        rating: 2,
      },
    ];

    const stats = statsSummary(items);

    expect(stats.completionRate).toBeCloseTo(0.5);
    expect(stats.averageRating).toBe(2);
  });
});
