import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WatchlistItem } from '../../types/watchlistItem.js';
import {
  createWatchlistItem,
  deleteWatchlistItem,
  fetchWatchlist,
  patchWatchlistItem,
  WATCHLIST_READ_LATENCY_MS,
  WATCHLIST_WRITE_LATENCY_MS,
} from './watchlistApi.js';

async function finishAfter<T>(promise: Promise<T>, delay: number): Promise<T> {
  await vi.advanceTimersByTimeAsync(delay);
  return promise;
}

describe('watchlistApi', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('creates, updates, and deletes an item in module memory', async () => {
    const item: WatchlistItem = {
      id: 'test-book',
      type: 'book',
      title: 'Test Book',
      genre: 'Testing',
      status: 'want',
      dateAdded: '2026-09-09',
    };

    await finishAfter(
      createWatchlistItem(item),
      WATCHLIST_WRITE_LATENCY_MS
    );

    const updated = await finishAfter(
      patchWatchlistItem(item.id, { status: 'done', rating: 4 }),
      WATCHLIST_WRITE_LATENCY_MS
    );
    expect(updated).toMatchObject({ status: 'done', rating: 4 });

    const items = await finishAfter(
      fetchWatchlist(),
      WATCHLIST_READ_LATENCY_MS
    );
    expect(items.some((entry) => entry.id === item.id)).toBe(true);

    await finishAfter(
      deleteWatchlistItem(item.id),
      WATCHLIST_WRITE_LATENCY_MS
    );
  });

  it('rejects a simulated write without changing the list', async () => {
    const before = await finishAfter(
      fetchWatchlist(),
      WATCHLIST_READ_LATENCY_MS
    );
    const deletion = deleteWatchlistItem(before[0]!.id, { shouldFail: true });
    const rejection = expect(deletion).rejects.toThrow('Simulated failure');

    await vi.advanceTimersByTimeAsync(WATCHLIST_WRITE_LATENCY_MS);
    await rejection;

    const after = await finishAfter(
      fetchWatchlist(),
      WATCHLIST_READ_LATENCY_MS
    );
    expect(after).toEqual(before);
  });
});
