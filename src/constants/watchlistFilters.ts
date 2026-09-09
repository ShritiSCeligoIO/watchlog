import type { WatchStatus } from '../types/watchlistItem.js';

export type TypeFilter = 'all' | 'movie' | 'book';
export type StatusFilter = 'all' | WatchStatus;

export const TYPE_FILTER_PARAM = 'type';
export const STATUS_FILTER_PARAM = 'status';

export const DEFAULT_TYPE_FILTER: TypeFilter = 'all';
export const DEFAULT_STATUS_FILTER: StatusFilter = 'all';

/** Validate the external URL value before using it as app state. */
export function isTypeFilter(value: string | null): value is TypeFilter {
  return value === 'all' || value === 'movie' || value === 'book';
}

/** Validate the external URL value before using it as app state. */
export function isStatusFilter(value: string | null): value is StatusFilter {
  return (
    value === 'all' ||
    value === 'want' ||
    value === 'watching' ||
    value === 'done'
  );
}
