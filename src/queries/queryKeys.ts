import type { SearchMediaType } from '../features/search/searchTypes.js';

/** Build every query key in one place. */
export const queryKeys = {
  watchlist: ['watchlist'] as const,

  search: (mediaType: SearchMediaType, query: string) =>
    ['search', mediaType, query] as const,
} as const;
