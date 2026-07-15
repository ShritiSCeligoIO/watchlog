import type { WatchlistItem } from '../types/watchlistItem.js';
import { hasRating } from '../types/watchlistItem.js';

export type SortDirection = 'asc' | 'desc';

/**
 * Sort by star rating. Items without a rating sort to the end.
 * Uses destructuring when comparing pairs.
 */
export function sortByRating(
  items: WatchlistItem[],
  direction: SortDirection = 'desc'
): WatchlistItem[] {
  const multiplier = direction === 'asc' ? 1 : -1;
  const unratedSortValue =
    direction === 'asc' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;

  return [...items].sort((first, second) => {
    const firstRating = hasRating(first) ? first.rating : unratedSortValue;
    const secondRating = hasRating(second) ? second.rating : unratedSortValue;

    if (firstRating === secondRating) {
      return first.title.localeCompare(second.title);
    }

    return (firstRating - secondRating) * multiplier;
  });
}
