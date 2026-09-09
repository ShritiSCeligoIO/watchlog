import { mockWatchlist } from '../fixtures/mockWatchlist.js';
import { applyWatchlistUpdate } from './applyWatchlistUpdate.js';

describe('applyWatchlistUpdate', () => {
  it('applies a rating to a completed item without mutating the input', () => {
    const item = mockWatchlist[3]!;
    const updated = applyWatchlistUpdate(item, { status: 'done', rating: 4 });

    expect(updated).toMatchObject({ status: 'done', rating: 4 });
    expect(updated).not.toBe(item);
    expect(item).not.toHaveProperty('rating');
  });

  it('removes ratings explicitly or when status is not done', () => {
    const done = mockWatchlist[0]!;

    expect(applyWatchlistUpdate(done, { rating: null })).not.toHaveProperty(
      'rating'
    );
    expect(
      applyWatchlistUpdate(done, { status: 'watching', rating: 5 })
    ).not.toHaveProperty('rating');
  });
});
