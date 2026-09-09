import { queryKeys } from './queryKeys.js';

describe('queryKeys', () => {
  it('keeps media type and query in each search key', () => {
    expect(queryKeys.search('book', 'dune')).toEqual([
      'search',
      'book',
      'dune',
    ]);
    expect(queryKeys.watchlist).toEqual(['watchlist']);
  });
});
