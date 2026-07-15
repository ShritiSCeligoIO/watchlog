import type { WatchlistItem, WatchStatus } from '../types/watchlistItem.js';

/** Return only items whose status matches the given value. */
export function filterByStatus(
  items: WatchlistItem[],
  status: WatchStatus
): WatchlistItem[] {
  return items.filter((item) => item.status === status);
}
