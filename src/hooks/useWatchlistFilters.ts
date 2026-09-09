import { useState } from 'react';
import {
  DEFAULT_STATUS_FILTER,
  DEFAULT_TYPE_FILTER,
  type StatusFilter,
  type TypeFilter,
} from '../constants/watchlistFilters.js';

export interface WatchlistFilters {
  typeFilter: TypeFilter;
  statusFilter: StatusFilter;
  setTypeFilter: (value: TypeFilter) => void;
  setStatusFilter: (value: StatusFilter) => void;
}

/** Keep Stage 2 filters local; refreshing the page resets them. */
export function useWatchlistFilters(): WatchlistFilters {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(DEFAULT_TYPE_FILTER);
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>(DEFAULT_STATUS_FILTER);

  return { typeFilter, statusFilter, setTypeFilter, setStatusFilter };
}
