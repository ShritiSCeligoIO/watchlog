import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toErrorMessage } from '../api/isRetryableError.js';
import RemoveItemDialog from '../components/RemoveItemDialog';
import SearchPanel from '../components/SearchPanel';
import ServerFailureToggle from '../components/ServerFailureToggle';
import WatchlistItemCard from '../components/WatchlistItemCard';
import WatchlistStats from '../components/WatchlistStats';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import type { StatusFilter, TypeFilter } from '../constants/watchlistFilters';
import {
  useRemoveWatchlistItem,
  useWatchlist,
} from '../features/watchlist/watchlistQueries';
import { useWatchlistFilters } from '../hooks/useWatchlistFilters';
import { useUiStore } from '../stores/uiStore';
import { filterWatchlistItems } from '../utils/filterWatchlistItems.js';

export default function WatchlistPage() {
  // Filters stay in the URL so a filtered view remains shareable.
  const { typeFilter, statusFilter, setTypeFilter, setStatusFilter, filterQuery } =
    useWatchlistFilters();

  const { data: items = [], isPending, isError, error, isFetching, refetch } =
    useWatchlist();

  const filteredItems = useMemo(
    () => filterWatchlistItems(items, typeFilter, statusFilter),
    [items, typeFilter, statusFilter]
  );

  // Which item is awaiting confirmation is UI state; removing it is a mutation.
  const pendingRemoval = useUiStore((state) => state.pendingRemoval);
  const cancelRemoval = useUiStore((state) => state.cancelRemoval);
  const removeItem = useRemoveWatchlistItem();

  return (
    <section aria-label="Watchlist">
      <ServerFailureToggle />

      <SearchPanel />

      <WatchlistStats items={filteredItems} />

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

      <div className="mb-4 flex flex-wrap items-baseline gap-3">
        <h2 className="text-xl font-semibold">
          Your watchlist ({filteredItems.length}
          {filteredItems.length !== items.length ? ` of ${items.length}` : ''})
        </h2>
        {/* Fetching while data is already on screen is the stale-while-revalidate
            refresh, which is why the list is not replaced by a loading state. */}
        {isFetching && !isPending && (
          <span className="text-xs text-muted-foreground" aria-live="polite">
            Refreshing…
          </span>
        )}
      </div>

      {removeItem.isError && (
        <p className="mb-4 text-sm text-destructive" role="alert">
          {toErrorMessage(removeItem.error, 'Could not remove that item.')}
        </p>
      )}

      {isPending ? (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Loading your watchlist…
        </p>
      ) : isError ? (
        <div role="alert" className="space-y-3">
          <p className="text-sm text-destructive">
            {toErrorMessage(error, 'Could not load your watchlist.')}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : filteredItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No items match the current filters.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredItems.map((item) => (
            <WatchlistItemCard key={item.id} item={item} filterQuery={filterQuery} />
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

      {/* One dialog for the whole page, driven by the store rather than one
          instance per card. */}
      <RemoveItemDialog
        open={pendingRemoval !== null}
        onOpenChange={(open) => {
          if (!open) {
            cancelRemoval();
          }
        }}
        itemTitle={pendingRemoval?.title ?? ''}
        onConfirm={() => {
          if (pendingRemoval) {
            removeItem.mutate(pendingRemoval.id);
          }
        }}
      />
    </section>
  );
}
