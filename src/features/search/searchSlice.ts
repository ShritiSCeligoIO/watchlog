import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { BookSearchResult } from '../../api/openLibraryClient.js';
import type { MovieSearchResult } from '../../api/tmdbClient.js';

export type SearchMediaType = 'book' | 'movie';

export type MediaSearchResult = BookSearchResult | MovieSearchResult;

export interface SearchState {
  mediaType: SearchMediaType;
  query: string;
  results: MediaSearchResult[];
  loading: boolean;
  error: string | null;
}

const initialState: SearchState = {
  mediaType: 'book',
  query: '',
  results: [],
  loading: false,
  error: null,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    searchQueryChanged(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },

    searchMediaTypeChanged(state, action: PayloadAction<SearchMediaType>) {
      state.mediaType = action.payload;
      state.results = [];
      state.error = null;
    },

    searchStarted(state) {
      state.loading = true;
      state.error = null;
    },

    searchSucceeded(state, action: PayloadAction<MediaSearchResult[]>) {
      state.results = action.payload;
      state.loading = false;
      state.error = null;
    },

    searchFailed(state, action: PayloadAction<string>) {
      state.results = [];
      state.loading = false;
      state.error = action.payload;
    },

    searchCleared(state) {
      state.results = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  searchCleared,
  searchFailed,
  searchMediaTypeChanged,
  searchQueryChanged,
  searchStarted,
  searchSucceeded,
} = searchSlice.actions;

export default searchSlice.reducer;
