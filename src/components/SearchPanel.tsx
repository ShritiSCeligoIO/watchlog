import { toErrorMessage } from '../api/isRetryableError.js';
import type { BookSearchResult } from '../api/openLibraryClient.js';
import type { MovieSearchResult } from '../api/tmdbClient.js';
import { MIN_SEARCH_QUERY_LENGTH } from '../constants/search.js';
import type { SearchMediaType } from '../features/search/searchTypes.js';
import { useSearchQuery } from '../features/search/useSearchQuery';
import {
  useAddWatchlistItem,
  useWatchlist,
} from '../features/watchlist/watchlistQueries';
import { useUiStore } from '../stores/uiStore';
import {
  bookSearchResultToWatchlistItem,
  movieSearchResultToWatchlistItem,
  watchlistIdForBookSearch,
  watchlistIdForMovieSearch,
} from '../utils/searchMappers.js';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export default function SearchPanel() {
  const mediaType = useUiStore((state) => state.mediaType);
  const query = useUiStore((state) => state.query);
  const setMediaType = useUiStore((state) => state.setMediaType);
  const setQuery = useUiStore((state) => state.setQuery);

  const {
    results,
    isSearching,
    errorMessage,
    movieSearchUnavailable,
    queryLongEnough,
    trimmedQuery,
  } = useSearchQuery();

  const { data: items = [] } = useWatchlist();
  const addItem = useAddWatchlistItem();

  const watchlistIds = new Set(items.map((entry) => entry.id));
  // Driven by what has actually been typed, not by the debounced value, so the
  // hint does not reappear for a moment after a long query is entered.
  const liveQueryTooShort =
    query.trim().length > 0 && query.trim().length < MIN_SEARCH_QUERY_LENGTH;
  const showNoResults =
    !movieSearchUnavailable &&
    queryLongEnough &&
    !isSearching &&
    !errorMessage &&
    results.length === 0;

  function handleAdd(result: BookSearchResult | MovieSearchResult) {
    addItem.mutate(
      mediaType === 'book'
        ? bookSearchResultToWatchlistItem(result as BookSearchResult)
        : movieSearchResultToWatchlistItem(result as MovieSearchResult)
    );
  }

  return (
    <section
      aria-label="Search"
      className="mb-6 rounded-xl border bg-card p-4 shadow-sm sm:p-6"
    >
      <h2 className="mb-4 text-lg font-semibold">Search</h2>

      <Tabs
        value={mediaType}
        onValueChange={(value) => setMediaType(value as SearchMediaType)}
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
            onChange={(event) => setQuery(event.target.value)}
          />
        </TabsContent>

        <TabsContent value="movie">
          <Input
            type="search"
            name="searchQuery"
            value={query}
            placeholder="Search movies by title…"
            aria-label="Search movies"
            onChange={(event) => setQuery(event.target.value)}
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

      {liveQueryTooShort && (
        <p className="mt-3 text-sm text-muted-foreground">
          Type at least {MIN_SEARCH_QUERY_LENGTH} characters to search.
        </p>
      )}

      {showNoResults && (
        <p className="mt-3 text-sm text-muted-foreground">
          No results found for &quot;{trimmedQuery}&quot;.
        </p>
      )}

      {!movieSearchUnavailable && isSearching && (
        <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">
          Searching…
        </p>
      )}

      {!movieSearchUnavailable && errorMessage && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      )}

      {/* The optimistic add already flipped this row to "Added" and back, so
          this explains why the label reverted. */}
      {addItem.isError && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {toErrorMessage(addItem.error, 'Could not add that item.')}
        </p>
      )}

      {!movieSearchUnavailable && !isSearching && !errorMessage && results.length > 0 && (
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
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2"
              >
                <span className="text-sm font-medium">{result.title}</span>
                {alreadyAdded ? (
                  <span className="text-xs text-muted-foreground">Added</span>
                ) : (
                  <Button type="button" size="sm" onClick={() => handleAdd(result)}>
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
