import type { WatchlistItem } from '../types/watchlistItem.js';
import { hasRating } from '../types/watchlistItem.js';

export type SortDirection = 'asc' | 'desc';

/** Sort by rating without changing the original array. */
export function sortByRating(
  items: WatchlistItem[],
  direction: SortDirection = 'desc'
): WatchlistItem[] {
  return [...items].sort((first, second) => {
    if (!hasRating(first)) {
      return hasRating(second) ? 1 : first.title.localeCompare(second.title);
    }

    if (!hasRating(second)) {
      return -1;
    }

    const ratingDifference = first.rating - second.rating;
    if (ratingDifference === 0) {
      return first.title.localeCompare(second.title);
    }

    return direction === 'asc' ? ratingDifference : -ratingDifference;
  });
}
