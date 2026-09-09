import type { BookSearchResult } from '../api/openLibraryClient.js';
import type { MovieSearchResult } from '../api/tmdbClient.js';
import { isMovieSearchConfigured } from '../config.js';
import { MIN_SEARCH_QUERY_LENGTH } from '../constants/search.js';
import {
  selectSearchError,
  selectSearchLoading,
  selectSearchMediaType,
  selectSearchQuery,
  selectSearchResults,
} from '../features/search/searchSelectors';
import {
  searchMediaTypeChanged,
  searchQueryChanged,
  type SearchMediaType,
} from '../features/search/searchSlice';
import { selectAllItems } from '../features/watchlist/watchlistSelectors';
import { addItem } from '../features/watchlist/watchlistSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  bookSearchResultToWatchlistItem,
  movieSearchResultToWatchlistItem,
  watchlistIdForBookSearch,
  watchlistIdForMovieSearch,
} from '../utils/searchMappers.js';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

/** Search remote media and add a result to the shared watchlist. */
export default function SearchPanel() {
  const dispatch = useAppDispatch();
  const mediaType = useAppSelector(selectSearchMediaType);
  const query = useAppSelector(selectSearchQuery);
  const results = useAppSelector(selectSearchResults);
  const loading = useAppSelector(selectSearchLoading);
  const error = useAppSelector(selectSearchError);
  const items = useAppSelector(selectAllItems);

  const watchlistIds = new Set(items.map((entry) => entry.id));
  const trimmedQuery = query.trim();
  const queryLongEnough = trimmedQuery.length >= MIN_SEARCH_QUERY_LENGTH;
  const movieSearchUnavailable =
    mediaType === 'movie' && !isMovieSearchConfigured();
  const showNoResults =
    !movieSearchUnavailable &&
    queryLongEnough &&
    !loading &&
    !error &&
    results.length === 0;

  function handleAdd(result: BookSearchResult | MovieSearchResult) {
    dispatch(
      addItem(
        mediaType === 'book'
          ? bookSearchResultToWatchlistItem(result as BookSearchResult)
          : movieSearchResultToWatchlistItem(result as MovieSearchResult)
      )
    );
  }

  return (
    <section aria-label="Search" className="mb-6 rounded-xl border bg-card p-4 shadow-sm sm:p-6">
      <h2 className="mb-4 text-lg font-semibold">Search</h2>

      <Tabs
        value={mediaType}
        onValueChange={(value) =>
          dispatch(searchMediaTypeChanged(value as SearchMediaType))
        }
      >
        <TabsList aria-label="Search media type">
          <TabsTrigger value="book">Books</TabsTrigger>
          <TabsTrigger value="movie">Movies</TabsTrigger>
        </TabsList>
        <TabsContent value="book">
          <Input
            type="search"
            name="searchQuery"
            value={query}
            placeholder="Search books by title…"
            aria-label="Search books"
            onChange={(event) =>
              dispatch(searchQueryChanged(event.target.value))
            }
          />
        </TabsContent>
        <TabsContent value="movie">
          <Input
            type="search"
            name="searchQuery"
            value={query}
            placeholder="Search movies by title…"
            aria-label="Search movies"
            onChange={(event) =>
              dispatch(searchQueryChanged(event.target.value))
            }
          />
        </TabsContent>
      </Tabs>

      {movieSearchUnavailable && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          Movie search needs TMDB_API_KEY in .env at the repo root. Restart{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">npm run dev</code>{' '}
          after adding it.
        </p>
      )}
      {trimmedQuery.length > 0 && !queryLongEnough && (
        <p className="mt-3 text-sm text-muted-foreground">
          Type at least {MIN_SEARCH_QUERY_LENGTH} characters to search.
        </p>
      )}
      {showNoResults && (
        <p className="mt-3 text-sm text-muted-foreground">
          No results found for &quot;{trimmedQuery}&quot;.
        </p>
      )}
      {!movieSearchUnavailable && loading && (
        <p className="mt-3 text-sm text-muted-foreground" role="status">Searching…</p>
      )}
      {!movieSearchUnavailable && error && (
        <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>
      )}

      {!movieSearchUnavailable && !loading && !error && results.length > 0 && (
        <ul className="mt-4 space-y-2">
          {results.map((result) => {
            const watchlistId =
              mediaType === 'book'
                ? watchlistIdForBookSearch(result as BookSearchResult)
                : watchlistIdForMovieSearch(result as MovieSearchResult);
            const alreadyAdded = watchlistIds.has(watchlistId);

            return (
              <li
                key={`${mediaType}-${result.id}`}
                className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2"
              >
                <span className="text-sm font-medium">{result.title}</span>
                {alreadyAdded ? (
                  <span className="text-xs text-muted-foreground">Added</span>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleAdd(result)}
                  >
                    Add
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
