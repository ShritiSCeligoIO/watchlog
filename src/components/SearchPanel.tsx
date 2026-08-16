import type { BookSearchResult } from '../api/openLibraryClient.js';
import type { MovieSearchResult } from '../api/tmdbClient.js';
import { isMovieSearchConfigured } from '../config.js';
import { MIN_SEARCH_QUERY_LENGTH } from '../constants/search.js';
import type { SearchMediaType } from '../hooks/useMediaSearch';
import { useMediaSearch } from '../hooks/useMediaSearch';
import type { WatchlistItem } from '../types/watchlistItem.js';
import {
  watchlistIdForBookSearch,
  watchlistIdForMovieSearch,
} from '../utils/searchMappers.js';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface SearchPanelProps {
  items: WatchlistItem[];
  mediaType: SearchMediaType;
  onMediaTypeChange: (mediaType: SearchMediaType) => void;
  onAddBook: (result: BookSearchResult) => void;
  onAddMovie: (result: MovieSearchResult) => void;
}

export default function SearchPanel({
  items,
  mediaType,
  onMediaTypeChange,
  onAddBook,
  onAddMovie,
}: SearchPanelProps) {
  const { query, setQuery, results, loading, error } = useMediaSearch(mediaType);
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

  return (
    <section
      aria-label="Search"
      className="mb-6 rounded-xl border bg-card p-4 shadow-sm sm:p-6"
    >
      <h2 className="mb-4 text-lg font-semibold">Search</h2>

      <Tabs
        value={mediaType}
        onValueChange={(value) => onMediaTypeChange(value as SearchMediaType)}
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

      {query.trim().length > 0 && query.trim().length < MIN_SEARCH_QUERY_LENGTH && (
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
        <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">
          Searching…
        </p>
      )}

      {!movieSearchUnavailable && error && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
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
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2"
              >
                <span className="text-sm font-medium">{result.title}</span>
                {alreadyAdded ? (
                  <span className="text-xs text-muted-foreground">Added</span>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      mediaType === 'book'
                        ? onAddBook(result as BookSearchResult)
                        : onAddMovie(result as MovieSearchResult)
                    }
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
