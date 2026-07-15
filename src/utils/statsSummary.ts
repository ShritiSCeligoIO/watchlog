import type { WatchlistStats, WatchlistItem } from '../types/watchlistItem.js';
import { hasRating } from '../types/watchlistItem.js';

/** Compute total count, completion rate, and average rating for a watchlist. */
export function statsSummary(items: WatchlistItem[]): WatchlistStats {
  const totalCount = items.length;

  if (totalCount === 0) {
    return {
      totalCount: 0,
      completionRate: 0,
      averageRating: null,
    };
  }

  const doneCount = items.filter((item) => item.status === 'done').length;
  const ratedItems = items.filter(hasRating);
  const ratingSum = ratedItems.reduce((sum, item) => sum + item.rating, 0);

  return {
    totalCount,
    completionRate: doneCount / totalCount,
    averageRating:
      ratedItems.length === 0 ? null : ratingSum / ratedItems.length,
  };
}
