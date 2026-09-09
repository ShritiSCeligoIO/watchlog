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

  const doneItems = items.filter((item) => item.status === 'done');
  const ratedDoneItems = doneItems.filter(hasRating);
  const ratingSum = ratedDoneItems.reduce((sum, item) => sum + item.rating, 0);

  return {
    totalCount,
    completionRate: doneItems.length / totalCount,
    averageRating:
      ratedDoneItems.length === 0 ? null : ratingSum / ratedDoneItems.length,
  };
}
