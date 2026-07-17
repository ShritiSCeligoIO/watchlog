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
  const ratedDoneItems = items.filter(
    (item): item is WatchlistItem & { rating: NonNullable<WatchlistItem['rating']> } =>
      item.status === 'done' && hasRating(item)
  );
  const ratingSum = ratedDoneItems.reduce((sum, item) => sum + item.rating, 0);

  return {
    totalCount,
    completionRate: doneCount / totalCount,
    averageRating:
      ratedDoneItems.length === 0 ? null : ratingSum / ratedDoneItems.length,
  };
}
