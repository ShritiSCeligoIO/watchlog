import { createSelector } from '@reduxjs/toolkit';
import type {
  StatusFilter,
  TypeFilter,
} from '../../constants/watchlistFilters.js';
import type { RootState } from '../../store/rootReducer';
import type {
  WatchlistItem,
  WatchlistStats,
} from '../../types/watchlistItem.js';
import { filterWatchlistItems } from '../../utils/filterWatchlistItems.js';
import { statsSummary } from '../../utils/statsSummary.js';

export const selectAllItems = (state: RootState): WatchlistItem[] =>
  state.watchlist.items;

/** Primitive filter arguments give Reselect stable values to memoize. */
const selectTypeFilterArg = (_state: RootState, typeFilter: TypeFilter) =>
  typeFilter;

const selectStatusFilterArg = (
  _state: RootState,
  _typeFilter: TypeFilter,
  statusFilter: StatusFilter
) => statusFilter;

export const selectFilteredItems = createSelector(
  [selectAllItems, selectTypeFilterArg, selectStatusFilterArg],
  (items, typeFilter, statusFilter): WatchlistItem[] =>
    filterWatchlistItems(items, typeFilter, statusFilter)
);

export const selectFilteredStats = createSelector(
  [selectFilteredItems],
  (items): WatchlistStats => statsSummary(items)
);

export const selectItemById = (
  state: RootState,
  id: string | undefined
): WatchlistItem | undefined =>
  id === undefined
    ? undefined
    : state.watchlist.items.find((item) => item.id === id);
