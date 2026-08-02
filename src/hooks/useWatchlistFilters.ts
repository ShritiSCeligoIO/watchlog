import { useCallback } from 'react';
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

export function useWatchlistFilters(): WatchlistFilters {
  const [searchParams, setSearchParams] = useSearchParams();

  const typeParam = searchParams.get(TYPE_FILTER_PARAM);
  const statusParam = searchParams.get(STATUS_FILTER_PARAM);
  const typeFilter = isTypeFilter(typeParam) ? typeParam : DEFAULT_TYPE_FILTER;
  const statusFilter = isStatusFilter(statusParam)
    ? statusParam
    : DEFAULT_STATUS_FILTER;

  const updateFilter = useCallback(
    (param: string, value: string, defaultValue: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value === defaultValue) {
          next.delete(param);
        } else {
          next.set(param, value);
        }
        return next;
      });
    },
    [setSearchParams]
  );

  const setTypeFilter = useCallback(
    (value: TypeFilter) => {
      updateFilter(TYPE_FILTER_PARAM, value, DEFAULT_TYPE_FILTER);
    },
    [updateFilter]
  );

  const setStatusFilter = useCallback(
    (value: StatusFilter) => {
      updateFilter(STATUS_FILTER_PARAM, value, DEFAULT_STATUS_FILTER);
    },
    [updateFilter]
  );

  const filterQuery = searchParams.toString();

  return {
    typeFilter,
    statusFilter,
    setTypeFilter,
    setStatusFilter,
    filterQuery,
  };
}
