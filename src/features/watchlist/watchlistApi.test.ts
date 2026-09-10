import { seedWatchlist } from '../../fixtures/seedWatchlist.js';
import type { WatchlistItem } from '../../types/watchlistItem.js';
import {
  WatchlistApiError,
  createWatchlistItem,
  deleteWatchlistItem,
  fetchWatchlist,
  patchWatchlistItem,
  resetWatchlistStore,
} from './watchlistApi.js';

const newBook: WatchlistItem = {
  id: 'book-new',
  type: 'book',
  title: 'Piranesi',
  genre: 'Fantasy',
  status: 'want',
  dateAdded: '2026-04-01',
};

describe('fake watchlist backend', () => {
  it('returns independent copies of the seed list', async () => {
    const first = await fetchWatchlist();
    first[0]!.title = 'Mutated';

    expect(await fetchWatchlist()).toHaveLength(seedWatchlist.length);
    expect((await fetchWatchlist())[0]?.title).toBe('Arrival');
  });

  it('creates, rejects duplicates, and can reset', async () => {
    await expect(createWatchlistItem(newBook)).resolves.toEqual(newBook);
    await expect(createWatchlistItem(newBook)).rejects.toBeInstanceOf(
      WatchlistApiError
    );

    resetWatchlistStore();
    expect(await fetchWatchlist()).toHaveLength(seedWatchlist.length);
  });

  it('patches status/rating and removes an item', async () => {
    await expect(
      patchWatchlistItem('book-2', { status: 'done', rating: 5 })
    ).resolves.toMatchObject({ status: 'done', rating: 5 });
    await deleteWatchlistItem('book-2');
    expect((await fetchWatchlist()).some(({ id }) => id === 'book-2')).toBe(false);
  });

  it('rejects missing items and forced write failures', async () => {
    await expect(deleteWatchlistItem('missing')).rejects.toThrow(
      'no longer on the watchlist'
    );
    await expect(
      patchWatchlistItem('missing', { status: 'done' })
    ).rejects.toThrow('no longer on the watchlist');
    await expect(
      createWatchlistItem(newBook, { shouldFail: true })
    ).rejects.toThrow('Simulated failure');
  });

  it('honours an already-aborted read signal', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      fetchWatchlist({ signal: controller.signal })
    ).rejects.toMatchObject({ name: 'AbortError' });
  });
});
