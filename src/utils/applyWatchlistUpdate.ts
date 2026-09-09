import type {
  WatchlistItem,
  WatchlistItemUpdate,
} from '../types/watchlistItem.js';

/** Apply an edit and keep ratings only on completed items. */
export function applyWatchlistUpdate(
  item: WatchlistItem,
  update: WatchlistItemUpdate
): WatchlistItem {
  const { rating, ...rest } = update;
  const next: WatchlistItem = { ...item, ...rest };

  if (rating === null) {
    delete next.rating;
  } else if (rating !== undefined) {
    next.rating = rating;
  }

  if (next.status !== 'done') {
    delete next.rating;
  }

  return next;
}
