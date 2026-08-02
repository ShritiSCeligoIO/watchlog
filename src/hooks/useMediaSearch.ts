import { useEffect, useState } from 'react';
import {
  searchBooks,
  type BookSearchResult,
} from '../api/openLibraryClient.js';
import {
  searchMovies,
  type MovieSearchResult,
} from '../api/tmdbClient.js';
import { isMovieSearchConfigured } from '../config.js';
import { MIN_SEARCH_QUERY_LENGTH } from '../constants/search.js';

export type SearchMediaType = 'book' | 'movie';

export type MediaSearchResult = BookSearchResult | MovieSearchResult;

export interface UseMediaSearchResult {
  query: string;
  setQuery: (query: string) => void;
  results: MediaSearchResult[];
  loading: boolean;
  error: string | null;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

/**
 * Custom hook: search books or movies when `query` or `mediaType` changes.
 * Cancels in-flight requests via AbortController when the user types again.
 */
export function useMediaSearch(
  mediaType: SearchMediaType
): UseMediaSearchResult {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < MIN_SEARCH_QUERY_LENGTH) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    if (mediaType === 'movie' && !isMovieSearchConfigured()) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function runSearch() {
      setLoading(true);
      setError(null);

      try {
        const data =
          mediaType === 'book'
            ? await searchBooks(trimmed, { signal: controller.signal })
            : await searchMovies(trimmed, { signal: controller.signal });

        if (controller.signal.aborted) {
          return;
        }

        setResults(data);
      } catch (err) {
        if (controller.signal.aborted || isAbortError(err)) {
          return;
        }
        const message =
          err instanceof Error ? err.message : 'Search failed';
        setResults([]);
        setError(message);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    runSearch();

    return () => {
      controller.abort();
    };
  }, [query, mediaType]);

  return { query, setQuery, results, loading, error };
}
