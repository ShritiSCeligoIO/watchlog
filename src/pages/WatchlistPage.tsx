import { useState } from 'react';
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
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

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

      <div className="mb-6 rounded-xl border bg-card p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-semibold">Filters</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="type-filter">Type</Label>
            <Select
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value as TypeFilter)}
            >
              <SelectTrigger id="type-filter" aria-label="Filter list by type">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="movie">Movies</SelectItem>
                <SelectItem value="book">Books</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
              <SelectTrigger id="status-filter" aria-label="Filter list by status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="want">Want</SelectItem>
                <SelectItem value="watching">Watching / Reading</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <h2 className="mb-4 text-xl font-semibold">
        Your watchlist ({filteredItems.length}
        {filteredItems.length !== items.length ? ` of ${items.length}` : ''})
      </h2>

      {filteredItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">No items match the current filters.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
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
        <p className="mt-4 text-sm text-muted-foreground">
          Share this view:{' '}
          <Link
            to={{ pathname: '/watchlist', search: filterQuery }}
            className="font-medium text-primary hover:underline"
          >
            /watchlist?{filterQuery}
          </Link>
        </p>
      )}
    </section>
  );
}
