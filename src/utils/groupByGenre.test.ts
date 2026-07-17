import { describe, expect, it } from 'vitest';
import type { WatchlistItem } from '../types/watchlistItem.js';
import { mockWatchlist } from '../fixtures/mockWatchlist.js';
import { groupByGenre } from './groupByGenre.js';

describe('groupByGenre', () => {
  it('groups items under genre keys using Record<string, WatchlistItem[]>', () => {
    const grouped = groupByGenre(mockWatchlist);

    expect(Object.keys(grouped)).toEqual(
      expect.arrayContaining(['Science Fiction', 'Comedy', 'Thriller'])
    );
    expect(grouped['Science Fiction']).toHaveLength(3);
    expect(grouped['Comedy']).toHaveLength(1);
    expect(grouped['Thriller']).toHaveLength(1);
  });

  it('preserves item order within each genre bucket', () => {
    const grouped = groupByGenre(mockWatchlist);

    expect(grouped['Science Fiction']?.map((item) => item.id)).toEqual([
      'movie-1',
      'book-1',
      'book-2',
    ]);
  });

  it('maps comedy and thriller buckets to the expected single items', () => {
    const grouped = groupByGenre(mockWatchlist);

    expect(grouped['Comedy']?.[0]?.id).toBe('movie-2');
    expect(grouped['Thriller']?.[0]?.id).toBe('movie-3');
  });

  it('returns an empty object for an empty watchlist', () => {
    expect(groupByGenre([])).toEqual({});
  });

  it('places a single item under its genre key', () => {
    const single: WatchlistItem[] = [
      {
        id: 'movie-2',
        type: 'movie',
        title: 'The Grand Budapest Hotel',
        genre: 'Comedy',
        status: 'done',
        dateAdded: '2026-01-20',
        rating: 4,
      },
    ];

    expect(groupByGenre(single)).toEqual({
      Comedy: single,
    });
  });

  it('groups all items under one key when genres match', () => {
    const sameGenre: WatchlistItem[] = [
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
        id: 'book-1',
        type: 'book',
        title: 'Project Hail Mary',
        genre: 'Science Fiction',
        status: 'watching',
        dateAdded: '2026-02-01',
      },
    ];

    const grouped = groupByGenre(sameGenre);
    expect(Object.keys(grouped)).toEqual(['Science Fiction']);
    expect(grouped['Science Fiction']).toHaveLength(2);
  });

  it('does not mutate the original array', () => {
    const copy = [...mockWatchlist];
    groupByGenre(mockWatchlist);
    expect(mockWatchlist).toEqual(copy);
  });
});
