import { describe, expect, it } from 'vitest';
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

  it('returns an empty object for an empty watchlist', () => {
    expect(groupByGenre([])).toEqual({});
  });
});
