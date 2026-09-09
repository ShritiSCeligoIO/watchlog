import type { WatchStatus } from '../types/watchlistItem.js';

export type TypeFilter = 'all' | 'movie' | 'book';
export type StatusFilter = 'all' | WatchStatus;

export const DEFAULT_TYPE_FILTER: TypeFilter = 'all';
export const DEFAULT_STATUS_FILTER: StatusFilter = 'all';
