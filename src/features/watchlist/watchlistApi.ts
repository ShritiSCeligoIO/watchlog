import { seedWatchlist } from '../../fixtures/seedWatchlist.js';
import type {
  WatchlistItem,
  WatchlistItemUpdate,
} from '../../types/watchlistItem.js';
import { applyWatchlistUpdate } from '../../utils/applyWatchlistUpdate.js';

// Mock async backend. Module state resets on reload and is never persisted.

/** Enough delay for a pending state and an optimistic update to be visible. */
export const WATCHLIST_READ_LATENCY_MS = 350;
export const WATCHLIST_WRITE_LATENCY_MS = 600;

export class WatchlistApiError extends Error {
  readonly retryable: boolean;

  constructor(message: string, options: { retryable?: boolean } = {}) {
    super(message);
    this.name = 'WatchlistApiError';
    this.retryable = options.retryable ?? false;
  }
}

export interface WatchlistWriteOptions {
  /** Force this write to reject for the rollback demonstration. */
  shouldFail?: boolean;
  signal?: AbortSignal;
}

let items: WatchlistItem[] = [...seedWatchlist];

/** Latency that still honours cancellation, so an abandoned read stops waiting. */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);

    function onAbort() {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    }

    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

async function beginWrite(options: WatchlistWriteOptions): Promise<void> {
  await sleep(WATCHLIST_WRITE_LATENCY_MS, options.signal);

  if (options.shouldFail) {
    throw new WatchlistApiError(
      'The server rejected the change. Simulated failure is switched on.'
    );
  }
}

export async function fetchWatchlist(
  options: { signal?: AbortSignal } = {}
): Promise<WatchlistItem[]> {
  await sleep(WATCHLIST_READ_LATENCY_MS, options.signal);
  // A copy, so a cached query result can never alias the collection.
  return items.map((item) => ({ ...item }));
}

export async function createWatchlistItem(
  item: WatchlistItem,
  options: WatchlistWriteOptions = {}
): Promise<WatchlistItem> {
  await beginWrite(options);

  if (items.some((entry) => entry.id === item.id)) {
    throw new WatchlistApiError(`"${item.title}" is already on the watchlist.`);
  }

  items = [...items, item];
  return { ...item };
}

export async function deleteWatchlistItem(
  id: string,
  options: WatchlistWriteOptions = {}
): Promise<void> {
  await beginWrite(options);

  if (!items.some((entry) => entry.id === id)) {
    throw new WatchlistApiError('That item is no longer on the watchlist.');
  }

  items = items.filter((entry) => entry.id !== id);
}

export async function patchWatchlistItem(
  id: string,
  update: WatchlistItemUpdate,
  options: WatchlistWriteOptions = {}
): Promise<WatchlistItem> {
  await beginWrite(options);

  const existing = items.find((entry) => entry.id === id);
  if (!existing) {
    throw new WatchlistApiError('That item is no longer on the watchlist.');
  }

  const updated = applyWatchlistUpdate(existing, update);
  items = items.map((entry) => (entry.id === id ? updated : entry));
  return { ...updated };
}
