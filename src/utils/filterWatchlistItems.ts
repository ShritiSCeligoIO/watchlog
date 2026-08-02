import type { StatusFilter, TypeFilter } from '../constants/watchlistFilters.js';
import type { WatchlistItem } from '../types/watchlistItem.js';
import { filterByStatus } from './filterByStatus.js';

/** Apply URL-driven type and status filters to a watchlist. */
export function filterWatchlistItems(
  items: WatchlistItem[],
  typeFilter: TypeFilter,
  statusFilter: StatusFilter
): WatchlistItem[] {
  let filtered = items;

  if (typeFilter !== 'all') {
    filtered = filtered.filter((item) => item.type === typeFilter);
  }

  if (statusFilter !== 'all') {
    filtered = filterByStatus(filtered, statusFilter);
  }

  return filtered;
}
