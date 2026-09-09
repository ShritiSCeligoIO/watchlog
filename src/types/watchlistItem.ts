import { applyWatchlistUpdate } from '../utils/applyWatchlistUpdate.js';

export type WatchStatus = 'want' | 'watching' | 'done';

export type StarRating = 1 | 2 | 3 | 4 | 5;

export interface BaseWatchlistItem {
  id: string;
  title: string;
  genre: string;
  status: WatchStatus;
  /** ISO date such as 2026-07-14. */
  dateAdded: string;
  rating?: StarRating;
}

export interface MovieItem extends BaseWatchlistItem {
  type: 'movie';
  director?: string;
  releaseYear?: number;
}

export interface BookItem extends BaseWatchlistItem {
  type: 'book';
  author?: string;
  publishYear?: number;
}

export type WatchlistItem = MovieItem | BookItem;

export type WatchlistItemUpdate = Omit<
  Partial<Omit<WatchlistItem, 'id' | 'type'>>,
  'rating'
> & {
  /** null means remove an existing rating. */
  rating?: StarRating | null;
};

export interface WatchlistStats {
  totalCount: number;
  /** A number from 0 to 1. */
  completionRate: number;
  /** The average for rated, done items; null when there are none. */
  averageRating: number | null;
}

export function isMovieItem(item: WatchlistItem): item is MovieItem {
  return item.type === 'movie';
}

export function isBookItem(item: WatchlistItem): item is BookItem {
  return item.type === 'book';
}

export function hasRating(
  item: WatchlistItem
): item is WatchlistItem & { rating: StarRating } {
  return item.rating !== undefined;
}

/** Stage 5 name kept for consumers; Stage 6 uses the shared utility name. */
export const applyWatchlistItemUpdate = applyWatchlistUpdate;
