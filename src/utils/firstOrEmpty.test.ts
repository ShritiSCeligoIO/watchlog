import { describe, expect, it } from 'vitest';
import { mockWatchlist } from '../fixtures/mockWatchlist.js';
import { firstOrEmpty } from './firstOrEmpty.js';

describe('firstOrEmpty', () => {
  it('returns an empty array when input is empty', () => {
    expect(firstOrEmpty([])).toEqual([]);
    expect(firstOrEmpty<string>([])).toEqual([]);
  });

  it('returns a one-item array with the first watchlist item', () => {
    expect(firstOrEmpty(mockWatchlist)).toEqual([mockWatchlist[0]]);
  });

  it('works with other types because T is generic', () => {
    expect(firstOrEmpty(['alpha', 'beta'])).toEqual(['alpha']);
    expect(firstOrEmpty([42, 99])).toEqual([42]);
  });

  it('does not mutate the original array', () => {
    const items = [...mockWatchlist];
    firstOrEmpty(items);
    expect(items).toEqual(mockWatchlist);
  });
});
