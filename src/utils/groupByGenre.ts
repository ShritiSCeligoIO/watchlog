import type { WatchlistItem } from '../types/watchlistItem.js';

/**
 * Group items by genre string.
 * Return type uses `Record<string, T>` — a dictionary keyed by genre name.
 */
export function groupByGenre(
  items: WatchlistItem[]
): Record<string, WatchlistItem[]> {
  return items.reduce<Record<string, WatchlistItem[]>>((groups, item) => {
    const { genre } = item;
    const existing = groups[genre] ?? [];
    return {
      ...groups,
      [genre]: [...existing, item],
    };
  }, {});
}
