/**
 * Returns a one-item array with the first element, or an empty array when input is empty.
 * Generic helper — works for any item type (WatchlistItem, string, number, etc.).
 */
export function firstOrEmpty<T>(items: T[]): T[] {
  if (items.length === 0) {
    return [];
  }

  return [items[0] as T];
}
