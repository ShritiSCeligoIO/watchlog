import type { WatchlistItem } from '../types/watchlistItem.js';

export function groupByGenre(
  items: WatchlistItem[]
): Record<string, WatchlistItem[]> {
  const groups: Record<string, WatchlistItem[]> = {};

  for (const item of items) {
    const group = groups[item.genre];
    if (group) {
      group.push(item);
    } else {
      groups[item.genre] = [item];
    }
  }

  return groups;
}
