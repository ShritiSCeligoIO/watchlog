import { describe, expect, it } from 'vitest';
import type { WatchlistItem } from '../types/watchlistItem.js';
import { mockWatchlist } from '../fixtures/mockWatchlist.js';
import { filterByStatus } from './filterByStatus.js';

describe('filterByStatus', () => {
  it('returns only items with the requested status', () => {
    const done = filterByStatus(mockWatchlist, 'done');

    expect(done).toHaveLength(2);
    expect(done.every((item) => item.status === 'done')).toBe(true);
    expect(done.map((item) => item.id)).toEqual(['movie-1', 'movie-2']);
  });

  it('returns items with the requested status when the status is "want"', () => {
    const want = filterByStatus(mockWatchlist, 'want');

    expect(want).toHaveLength(2);
    expect(want.every((item) => item.status === 'want')).toBe(true);
    expect(want.map((item) => item.id)).toEqual(['book-2', 'movie-3']);
  });

  it('returns only the watching item from mockWatchlist', () => {
    const watching = filterByStatus(mockWatchlist, 'watching');

    expect(watching).toHaveLength(1);
    expect(watching[0]?.id).toBe('book-1');
    expect(watching[0]?.status).toBe('watching');
  });

  it('returns an empty array when input is empty', () => {
    expect(filterByStatus([], 'want')).toEqual([]);
  });

  it('returns an empty array when no items match the requested status', () => {
    const onlyWant: WatchlistItem[] = [
      {
        id: 'book-2',
        type: 'book',
        title: 'Dune',
        genre: 'Science Fiction',
        status: 'want',
        dateAdded: '2026-03-05',
      },
    ];

    expect(filterByStatus(onlyWant, 'done')).toEqual([]);
  });

  it('returns a single-item array when only one item matches', () => {
    expect(filterByStatus(mockWatchlist, 'watching')).toHaveLength(1);
  });

  it('preserves the relative order of matching items', () => {
    const want = filterByStatus(mockWatchlist, 'want');
    expect(want.map((item) => item.id)).toEqual(['book-2', 'movie-3']);
  });

  it('does not mutate the original array', () => {
    const copy = [...mockWatchlist];
    filterByStatus(mockWatchlist, 'done');
    expect(mockWatchlist).toEqual(copy);
  });

  it('returns a new array instance even when all items match', () => {
    const allDone: WatchlistItem[] = [
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

    const result = filterByStatus(allDone, 'done');
    expect(result).not.toBe(allDone);
    expect(result).toEqual(allDone);
  });
});
