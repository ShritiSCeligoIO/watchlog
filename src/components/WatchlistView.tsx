import { useWatchlistData } from '../context/WatchlistDataContext';
import { useWatchlistFilters } from '../hooks/useWatchlistFilters';
import type {
  StatusFilter,
  TypeFilter,
} from '../constants/watchlistFilters.js';
import { filterWatchlistItems } from '../utils/filterWatchlistItems.js';
import ItemDetailPanel from './ItemDetailPanel';
import SearchPanel from './SearchPanel';
import WatchlistItemCard from './WatchlistItemCard';

/** Render the list and detail columns on one page. */
export default function WatchlistView() {
  const { items } = useWatchlistData();
  const { typeFilter, statusFilter, setTypeFilter, setStatusFilter } =
    useWatchlistFilters();

  const filteredItems = filterWatchlistItems(
    items,
    typeFilter,
    statusFilter
  );

  return (
    <div className="layout">
      <section className="list-column" aria-label="Watchlist">
        <SearchPanel />

        <div className="panel filters">
          <h2>Filters</h2>
          <div className="form-row">
            <label className="filter-field">
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
            <label className="filter-field">
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

        <h2 className="list-heading">
          Your watchlist ({filteredItems.length}
          {filteredItems.length !== items.length ? ` of ${items.length}` : ''})
        </h2>

        {filteredItems.length === 0 ? (
          <p className="message">No items match the current filters.</p>
        ) : (
          <div className="card-list">
            {filteredItems.map((item) => (
              <WatchlistItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <ItemDetailPanel />
    </div>
  );
}
