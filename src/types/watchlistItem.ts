/** Three-step status flow from the project brief. */
export type WatchStatus = 'want' | 'watching' | 'done';

/** Valid star ratings for completed items. */
export type StarRating = 1 | 2 | 3 | 4 | 5;

/** Fields every watchlist item shares, regardless of movie vs book. */
export interface BaseWatchlistItem {
  id: string;
  title: string;
  genre: string;
  status: WatchStatus;
  /** ISO-8601 date string, e.g. 2026-07-14 */
  dateAdded: string;
  /** Only meaningful when status is `done`. */
  rating?: StarRating;
}

export interface MovieWatchlistItem extends BaseWatchlistItem {
  type: 'movie';
  director?: string;
  releaseYear?: number;
}

export interface BookWatchlistItem extends BaseWatchlistItem {
  type: 'book';
  author?: string;
  publishYear?: number;
}

/** Discriminated union — use `item.type` to narrow movie vs book. */
export type WatchlistItem = MovieWatchlistItem | BookWatchlistItem;

/**
 * Partial update payload — every field optional except identity fields we omit.
 * Demonstrates `Partial` + `Omit` utility types.
 */
export type WatchlistItemUpdate = Partial<Omit<WatchlistItem, 'id' | 'type'>>;

/**
 * Lightweight row for list views — demonstrates `Pick`.
 */
export type WatchlistItemSummary = Pick<
  WatchlistItem,
  'id' | 'title' | 'status' | 'type' | 'genre'
>;

/** Aggregate stats returned by statsSummary(). */
export interface WatchlistStats {
  totalCount: number;
  /** Fraction of items with status `done`, 0–1. Returns 0 when list is empty. */
  completionRate: number;
  /** Mean rating across done items that have a star rating. null when none qualify. */
  averageRating: number | null;
}

/** Narrow a union to a movie item. Type guard for runtime checks. */
export function isMovieItem(item: WatchlistItem): item is MovieWatchlistItem {
  return item.type === 'movie';
}

/** Narrow a union to a book item. Type guard for runtime checks. */
export function isBookItem(item: WatchlistItem): item is BookWatchlistItem {
  return item.type === 'book';
}

/** Returns true when item has a valid 1–5 rating (typically status === 'done'). */
export function hasRating(
  item: WatchlistItem
): item is WatchlistItem & { rating: StarRating } {
  return item.rating !== undefined;
}
