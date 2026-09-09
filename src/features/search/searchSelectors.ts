import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../store/rootReducer';
import type { MediaSearchResult, SearchMediaType } from './searchSlice';

export const selectSearchMediaType = (state: RootState): SearchMediaType =>
  state.search.mediaType;

export const selectSearchQuery = (state: RootState): string =>
  state.search.query;

export const selectSearchResults = (state: RootState): MediaSearchResult[] =>
  state.search.results;

export const selectSearchLoading = (state: RootState): boolean =>
  state.search.loading;

export const selectSearchError = (state: RootState): string | null =>
  state.search.error;

/** Bundled for the saga, which needs both values in one `select`. */
export const selectSearchInput = createSelector(
  [selectSearchMediaType, selectSearchQuery],
  (mediaType, query) => ({ mediaType, query })
);
