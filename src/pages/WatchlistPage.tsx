import { Link } from 'react-router-dom';
import SearchPanel from '../components/SearchPanel';
import WatchlistItemCard from '../components/WatchlistItemCard';
import { useWatchlistData } from '../context/WatchlistDataContext';
import type { SearchMediaType } from '../hooks/useMediaSearch';
import { useWatchlistFilters } from '../hooks/useWatchlistFilters';
import type { BookSearchResult } from '../api/openLibraryClient.js';
import type { MovieSearchResult } from '../api/tmdbClient.js';
import type { StatusFilter, TypeFilter } from '../constants/watchlistFilters';
import {
  bookSearchResultToWatchlistItem,
  movieSearchResultToWatchlistItem,
} from '../utils/searchMappers.js';
import { filterWatchlistItems } from '../utils/filterWatchlistItems.js';
import { useState } from 'react';

export default function WatchlistPage() {
  const { items, addItem, removeItem } = useWatchlistData();
  const { typeFilter, statusFilter, setTypeFilter, setStatusFilter, filterQuery } =
    useWatchlistFilters();
  const [searchMediaType, setSearchMediaType] =
    useState<SearchMediaType>('book');
  const filteredItems = filterWatchlistItems(items, typeFilter, statusFilter);

  function handleAddBookFromSearch(result: BookSearchResult) {
    addItem(bookSearchResultToWatchlistItem(result));
  }

  function handleAddMovieFromSearch(result: MovieSearchResult) {
    addItem(movieSearchResultToWatchlistItem(result));
  }

  return (
    <section aria-label="Watchlist">
      <SearchPanel
        items={items}
        mediaType={searchMediaType}
        onMediaTypeChange={setSearchMediaType}
        onAddBook={handleAddBookFromSearch}
        onAddMovie={handleAddMovieFromSearch}
      />

      <div className="watchlog-panel watchlog-filters">
        <h2 className="watchlog-section-title">Filters</h2>
        <div className="watchlog-form">
          <label className="watchlog-filter-field">
            Type
            <select
              aria-label="Filter list by type"
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value as TypeFilter)
              }
            >
              <option value="all">All types</option>
              <option value="movie">Movies</option>
              <option value="book">Books</option>
            </select>
          </label>
          <label className="watchlog-filter-field">
            Status
            <select
              aria-label="Filter list by status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
            >
              <option value="all">All statuses</option>
              <option value="want">Want</option>
              <option value="watching">Watching / Reading</option>
              <option value="done">Done</option>
            </select>
          </label>
        </div>
      </div>

      <h2 className="watchlog-list-heading">
        Your watchlist ({filteredItems.length}
        {filteredItems.length !== items.length ? ` of ${items.length}` : ''})
      </h2>

      {filteredItems.length === 0 ? (
        <p className="watchlog-hint">No items match the current filters.</p>
      ) : (
        <div className="watchlog-card-list">
          {filteredItems.map((item) => (
            <WatchlistItemCard
              key={item.id}
              item={item}
              filterQuery={filterQuery}
              onRemove={removeItem}
            />
          ))}
        </div>
      )}

      {filterQuery && (
        <p className="watchlog-hint">
          Share this view:{' '}
          <Link to={{ pathname: '/watchlist', search: filterQuery }}>
            /watchlist?{filterQuery}
          </Link>
        </p>
      )}
    </section>
  );
}
