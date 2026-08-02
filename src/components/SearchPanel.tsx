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
    <section aria-label="Search" className="watchlog-panel watchlog-panel--search">
      <h2 className="watchlog-section-title">Search</h2>
      <div className="watchlog-form">
        <select
          value={mediaType}
          aria-label="Search media type"
          onChange={(event) =>
            onMediaTypeChange(event.target.value as SearchMediaType)
          }
        >
          <option value="book">Books</option>
          <option value="movie">Movies</option>
        </select>
        <input
          type="search"
          name="searchQuery"
          value={query}
          placeholder={
            mediaType === 'book' ? 'Search books by title…' : 'Search movies by title…'
          }
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      {movieSearchUnavailable && (
        <p className="watchlog-error">
          Movie search needs TMDB_API_KEY in .env at the repo root. Restart{' '}
          <code>npm run dev</code> after adding it.
        </p>
      )}
      {query.trim().length > 0 &&
        query.trim().length < MIN_SEARCH_QUERY_LENGTH && (
          <p className="watchlog-hint">
            Type at least {MIN_SEARCH_QUERY_LENGTH} characters to search.
          </p>
        )}
      {showNoResults && (
        <p className="watchlog-hint">
          No results found for &quot;{trimmedQuery}&quot;.
        </p>
      )}
      {!movieSearchUnavailable && loading && (
        <p className="watchlog-status">Searching…</p>
      )}
      {!movieSearchUnavailable && error && (
        <p className="watchlog-error">{error}</p>
      )}
      {!movieSearchUnavailable && !loading && !error && results.length > 0 && (
        <ul className="watchlog-search-results">
          {results.map((result) => {
            const watchlistId =
              mediaType === 'book'
                ? watchlistIdForBookSearch(result as BookSearchResult)
                : watchlistIdForMovieSearch(result as MovieSearchResult);
            const alreadyAdded = watchlistIds.has(watchlistId);

            return (
              <li key={`${mediaType}-${result.id}`} className="watchlog-search-hit">
                <span>{result.title}</span>
                {alreadyAdded ? (
                  <span className="watchlog-hint">Added</span>
                ) : (
                  <button
                    type="button"
                    className="watchlog-btn watchlog-btn--primary watchlog-btn--sm"
                    onClick={() =>
                      mediaType === 'book'
                        ? onAddBook(result as BookSearchResult)
                        : onAddMovie(result as MovieSearchResult)
                    }
                  >
                    Add
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
