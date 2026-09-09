import { useState } from 'react';
import type { BookSearchResult } from '../api/openLibraryClient.js';
import type { MovieSearchResult } from '../api/tmdbClient.js';
import { isMovieSearchConfigured } from '../config.js';
import { MIN_SEARCH_QUERY_LENGTH } from '../constants/search.js';
import { useWatchlistData } from '../context/WatchlistDataContext';
import type { SearchMediaType } from '../hooks/useMediaSearch';
import { useMediaSearch } from '../hooks/useMediaSearch';
import {
  bookSearchResultToWatchlistItem,
  movieSearchResultToWatchlistItem,
  watchlistIdForBookSearch,
  watchlistIdForMovieSearch,
} from '../utils/searchMappers.js';

/** Search remote media and add a result to the shared watchlist. */
export default function SearchPanel() {
  const { items, addItem } = useWatchlistData();
  const [mediaType, setMediaType] = useState<SearchMediaType>('book');
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

  function handleAdd(result: BookSearchResult | MovieSearchResult) {
    addItem(
      mediaType === 'book'
        ? bookSearchResultToWatchlistItem(result as BookSearchResult)
        : movieSearchResultToWatchlistItem(result as MovieSearchResult)
    );
  }

  return (
    <section aria-label="Search" className="panel">
      <h2>Search</h2>

      <div className="form-row">
        <select
          value={mediaType}
          aria-label="Search media type"
          onChange={(event) =>
            setMediaType(event.target.value as SearchMediaType)
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
            mediaType === 'book'
              ? 'Search books by title…'
              : 'Search movies by title…'
          }
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {movieSearchUnavailable && (
        <p className="message error">
          Movie search needs TMDB_API_KEY in .env at the repo root. Restart{' '}
          <code>npm run dev</code> after adding it.
        </p>
      )}
      {trimmedQuery.length > 0 && !queryLongEnough && (
        <p className="message">
          Type at least {MIN_SEARCH_QUERY_LENGTH} characters to search.
        </p>
      )}
      {showNoResults && (
        <p className="message">
          No results found for &quot;{trimmedQuery}&quot;.
        </p>
      )}
      {!movieSearchUnavailable && loading && (
        <p className="message" role="status">Searching…</p>
      )}
      {!movieSearchUnavailable && error && (
        <p className="message error" role="alert">{error}</p>
      )}

      {!movieSearchUnavailable && !loading && !error && results.length > 0 && (
        <ul className="search-results">
          {results.map((result) => {
            const watchlistId =
              mediaType === 'book'
                ? watchlistIdForBookSearch(result as BookSearchResult)
                : watchlistIdForMovieSearch(result as MovieSearchResult);
            const alreadyAdded = watchlistIds.has(watchlistId);

            return (
              <li
                key={`${mediaType}-${result.id}`}
                className="search-result"
              >
                <span>{result.title}</span>
                {alreadyAdded ? (
                  <span className="message">Added</span>
                ) : (
                  <button
                    type="button"
                    className="button primary small"
                    onClick={() => handleAdd(result)}
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
