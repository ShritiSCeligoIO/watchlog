import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toErrorMessage } from '../../api/isRetryableError.js';
import { searchBooks } from '../../api/openLibraryClient.js';
import { searchMovies } from '../../api/tmdbClient.js';
import { isMovieSearchConfigured } from '../../config.js';
import {
  MIN_SEARCH_QUERY_LENGTH,
  SEARCH_DEBOUNCE_MS,
} from '../../constants/search.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { queryKeys } from '../../queries/queryKeys.js';
import { SEARCH_STALE_TIME_MS } from '../../queries/queryClient.js';
import { useUiStore } from '../../stores/uiStore';
import type { MediaSearchResult } from './searchTypes.js';

export interface SearchQueryResult {
  results: MediaSearchResult[];
  isSearching: boolean;
  errorMessage: string | null;
  movieSearchUnavailable: boolean;
  queryLongEnough: boolean;
  trimmedQuery: string;
}

/** Fetch and cache results for the debounced search input. */
export function useSearchQuery(): SearchQueryResult {
  const { t } = useTranslation('search');
  const mediaType = useUiStore((state) => state.mediaType);
  const rawQuery = useUiStore((state) => state.query);

  const trimmedQuery = useDebouncedValue(rawQuery.trim(), SEARCH_DEBOUNCE_MS);

  const queryLongEnough = trimmedQuery.length >= MIN_SEARCH_QUERY_LENGTH;
  const movieSearchUnavailable =
    mediaType === 'movie' && !isMovieSearchConfigured();

  const { data, isFetching, error } = useQuery({
    queryKey: queryKeys.search(mediaType, trimmedQuery),
    // TanStack Query aborts this signal when the request becomes obsolete.
    queryFn: ({ signal }) =>
      mediaType === 'book'
        ? searchBooks(trimmedQuery, { signal })
        : searchMovies(trimmedQuery, { signal }),
    enabled: queryLongEnough && !movieSearchUnavailable,
    staleTime: SEARCH_STALE_TIME_MS,
  });

  return {
    results: data ?? [],
    // A disabled query can be pending, but it is not fetching.
    isSearching: isFetching,
    errorMessage: error ? toErrorMessage(error, t('errors.search')) : null,
    movieSearchUnavailable,
    queryLongEnough,
    trimmedQuery,
  };
}
