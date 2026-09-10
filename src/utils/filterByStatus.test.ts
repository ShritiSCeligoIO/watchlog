import { mockWatchlist } from '../fixtures/mockWatchlist.js';
import { filterByStatus } from './filterByStatus.js';

describe('filterByStatus', () => {
  it('returns only matching items in their original order', () => {
    const doneItems = filterByStatus(mockWatchlist, 'done');

    expect(doneItems.map((item) => item.id)).toEqual(['movie-1', 'movie-2']);
  });

  it('returns an empty array when nothing matches', () => {
    expect(filterByStatus([], 'want')).toEqual([]);
  });

  it('does not mutate the input array', () => {
    const originalOrder = mockWatchlist.map((item) => item.id);
    const result = filterByStatus(mockWatchlist, 'done');

    expect(mockWatchlist.map((item) => item.id)).toEqual(originalOrder);
    expect(result).not.toBe(mockWatchlist);
  });
});
