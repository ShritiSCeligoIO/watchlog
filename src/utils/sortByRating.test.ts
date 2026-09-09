import type { WatchlistItem } from '../types/watchlistItem.js';
import { mockWatchlist } from '../fixtures/mockWatchlist.js';
import { sortByRating } from './sortByRating.js';

describe('sortByRating', () => {
  it('sorts highest-first by default and puts unrated items last', () => {
    const sorted = sortByRating(mockWatchlist);

    expect(sorted.slice(0, 2).map((item) => item.rating)).toEqual([5, 4]);
    expect(sorted.slice(2).every((item) => item.rating === undefined)).toBe(true);
  });

  it('sorts rated items lowest-first when requested', () => {
    const ratings = sortByRating(mockWatchlist, 'asc')
      .slice(0, 2)
      .map((item) => item.rating);

    expect(ratings).toEqual([4, 5]);
  });

  it('sorts equal ratings alphabetically', () => {
    const tiedItems: WatchlistItem[] = [
      { ...mockWatchlist[0]!, id: 'z', title: 'Zulu', rating: 4 },
      { ...mockWatchlist[0]!, id: 'a', title: 'Alpha', rating: 4 },
    ];

    expect(sortByRating(tiedItems).map((item) => item.title)).toEqual([
      'Alpha',
      'Zulu',
    ]);
  });

  it('does not mutate the input array', () => {
    const originalOrder = mockWatchlist.map((item) => item.id);
    const sorted = sortByRating(mockWatchlist);

    expect(mockWatchlist.map((item) => item.id)).toEqual(originalOrder);
    expect(sorted).not.toBe(mockWatchlist);
  });
});
