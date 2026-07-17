import { describe, expect, it } from 'vitest';
import type { WatchlistItem } from '../types/watchlistItem.js';
import { mockWatchlist } from '../fixtures/mockWatchlist.js';
import { sortByRating } from './sortByRating.js';

describe('sortByRating', () => {
  it('sorts rated items highest-first by default and pushes unrated items to the end', () => {
    const sorted = sortByRating(mockWatchlist);

    expect(sorted[0]?.id).toBe('movie-1');
    expect(sorted[1]?.id).toBe('movie-2');
    expect(sorted.slice(2).every((item) => item.rating === undefined)).toBe(true);
  });

  it('defaults to descending order when direction is omitted', () => {
    expect(sortByRating(mockWatchlist).map((item) => item.id)).toEqual(
      sortByRating(mockWatchlist, 'desc').map((item) => item.id)
    );
  });

  it('sorts ascending when direction is asc', () => {
    const sorted = sortByRating(mockWatchlist, 'asc');

    expect(sorted[0]?.id).toBe('movie-2');
    expect(sorted[1]?.id).toBe('movie-1');
  });

  it('returns an empty array when input is empty', () => {
    expect(sortByRating([])).toEqual([]);
    expect(sortByRating([], 'asc')).toEqual([]);
  });

  it('returns a single-item array unchanged in position when only one item exists', () => {
    const single: WatchlistItem[] = [
      {
        id: 'movie-1',
        type: 'movie',
        title: 'Arrival',
        genre: 'Science Fiction',
        status: 'done',
        dateAdded: '2026-01-10',
        rating: 5,
      },
    ];

    expect(sortByRating(single)).toEqual(single);
  });

  it('keeps all unrated items in the tail for descending sort', () => {
    const sorted = sortByRating(mockWatchlist, 'desc');
    expect(sorted.slice(0, 2).every((item) => item.rating !== undefined)).toBe(true);
    expect(sorted.slice(2).every((item) => item.rating === undefined)).toBe(true);
  });

  it('keeps all unrated items in the tail for ascending sort', () => {
    const sorted = sortByRating(mockWatchlist, 'asc');
    expect(sorted.slice(0, 2).every((item) => item.rating !== undefined)).toBe(true);
    expect(sorted.slice(2).every((item) => item.rating === undefined)).toBe(true);
  });

  it('breaks ties on equal ratings alphabetically by title', () => {
    const tied: WatchlistItem[] = [
      {
        id: 'movie-z',
        type: 'movie',
        title: 'Zulu',
        genre: 'Drama',
        status: 'done',
        dateAdded: '2026-01-01',
        rating: 4,
      },
      {
        id: 'movie-a',
        type: 'movie',
        title: 'Alpha',
        genre: 'Drama',
        status: 'done',
        dateAdded: '2026-01-02',
        rating: 4,
      },
    ];

    const sorted = sortByRating(tied, 'desc');
    expect(sorted.map((item) => item.id)).toEqual(['movie-a', 'movie-z']);
  });

  it('does not mutate the original array', () => {
    const copy = [...mockWatchlist];
    sortByRating(mockWatchlist);
    expect(mockWatchlist).toEqual(copy);
  });

  it('places unrated watching items in the tail after rated items', () => {
    const sorted = sortByRating(mockWatchlist);
    const bookOneIndex = sorted.findIndex((item) => item.id === 'book-1');

    expect(bookOneIndex).toBeGreaterThanOrEqual(2);
    expect(sorted[bookOneIndex]?.rating).toBeUndefined();
    expect(sorted[bookOneIndex]?.status).toBe('watching');
  });

  it('sorts only unrated items by title when no ratings exist', () => {
    const unrated: WatchlistItem[] = [
      {
        id: 'book-2',
        type: 'book',
        title: 'Dune',
        genre: 'Science Fiction',
        status: 'want',
        dateAdded: '2026-03-05',
      },
      {
        id: 'book-1',
        type: 'book',
        title: 'Alpha Book',
        genre: 'Science Fiction',
        status: 'watching',
        dateAdded: '2026-02-01',
      },
    ];

    const sorted = sortByRating(unrated, 'desc');
    expect(sorted.map((item) => item.title)).toEqual(['Alpha Book', 'Dune']);
  });
});
