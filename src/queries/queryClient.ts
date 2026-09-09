import { QueryClient } from '@tanstack/react-query';
import { isRetryableError } from '../api/isRetryableError.js';

/** Attempts after the first one, for transient failures only. */
export const MAX_QUERY_RETRIES = 2;

export const RETRY_BACKOFF_MS = 300;

/** A repeated search stays fresh for five minutes. */
export const SEARCH_STALE_TIME_MS = 5 * 60 * 1000;

/** Kept short so an invalidation after a write visibly refetches. */
export const WATCHLIST_STALE_TIME_MS = 10 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry only errors explicitly marked as transient.
      retry: (failureCount, error) =>
        failureCount < MAX_QUERY_RETRIES && isRetryableError(error),
      retryDelay: (attemptIndex) => RETRY_BACKOFF_MS * 2 ** attemptIndex,
      refetchOnWindowFocus: false,
    },
    mutations: {
      // A repeated write can duplicate a change that already reached a server.
      retry: 0,
    },
  },
});
