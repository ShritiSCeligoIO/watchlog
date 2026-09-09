import { useSearchParams } from 'react-router-dom';
import {
  DEFAULT_STATUS_FILTER,
  DEFAULT_TYPE_FILTER,
  isStatusFilter,
  isTypeFilter,
  STATUS_FILTER_PARAM,
  TYPE_FILTER_PARAM,
  type StatusFilter,
  type TypeFilter,
} from '../constants/watchlistFilters.js';

export interface WatchlistFilters {
  typeFilter: TypeFilter;
  statusFilter: StatusFilter;
  setTypeFilter: (value: TypeFilter) => void;
  setStatusFilter: (value: StatusFilter) => void;
  filterQuery: string;
}

/** Let the URL own filters so refresh, back, and sharing keep the same view. */
export function useWatchlistFilters(): WatchlistFilters {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeValue = searchParams.get(TYPE_FILTER_PARAM);
  const statusValue = searchParams.get(STATUS_FILTER_PARAM);

  const typeFilter = isTypeFilter(typeValue) ? typeValue : DEFAULT_TYPE_FILTER;
  const statusFilter = isStatusFilter(statusValue)
    ? statusValue
    : DEFAULT_STATUS_FILTER;

  function setFilter(name: string, value: string, defaultValue: string) {
    const nextParams = new URLSearchParams(searchParams);
    if (value === defaultValue) {
      nextParams.delete(name);
    } else {
      nextParams.set(name, value);
    }
    setSearchParams(nextParams);
  }

  function setTypeFilter(value: TypeFilter) {
    setFilter(TYPE_FILTER_PARAM, value, DEFAULT_TYPE_FILTER);
  }

  function setStatusFilter(value: StatusFilter) {
    setFilter(STATUS_FILTER_PARAM, value, DEFAULT_STATUS_FILTER);
  }

  return {
    typeFilter,
    statusFilter,
    setTypeFilter,
    setStatusFilter,
    filterQuery: searchParams.toString(),
  };
}
