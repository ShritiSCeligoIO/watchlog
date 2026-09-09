import type { StateCreator } from 'zustand';
import type { SearchMediaType } from '../features/search/searchTypes.js';
import { applyTheme, systemTheme, type Theme } from '../lib/theme';

// This alias hides the middleware typing so every slice stays small.
export type UiSliceCreator<TSlice> = StateCreator<
  UiState,
  [
    ['zustand/devtools', never],
    ['zustand/persist', unknown],
    ['zustand/immer', never],
  ],
  [],
  TSlice
>;

export interface SearchInputSlice {
  mediaType: SearchMediaType;
  query: string;
  setMediaType: (mediaType: SearchMediaType) => void;
  setQuery: (query: string) => void;
}

export const createSearchInputSlice: UiSliceCreator<SearchInputSlice> = (
  set
) => ({
  mediaType: 'book',
  query: '',

  setMediaType: (mediaType) =>
    set(
      (state) => {
        state.mediaType = mediaType;
      },
      false,
      'search/setMediaType'
    ),

  setQuery: (query) =>
    set(
      (state) => {
        state.query = query;
      },
      false,
      'search/setQuery'
    ),
});

export interface ThemeSlice {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const createThemeSlice: UiSliceCreator<ThemeSlice> = (set, get) => ({
  theme: systemTheme(),

  setTheme: (theme) => {
    set(
      (state) => {
        state.theme = theme;
      },
      false,
      'theme/setTheme'
    );
    applyTheme(theme);
  },

  toggleTheme: () => {
    get().setTheme(get().theme === 'dark' ? 'light' : 'dark');
  },
});

/** The item awaiting removal confirmation, if any. */
export interface PendingRemoval {
  id: string;
  title: string;
}

export interface RemovalSlice {
  pendingRemoval: PendingRemoval | null;
  requestRemoval: (target: PendingRemoval) => void;
  cancelRemoval: () => void;
}

/** One shared target lets the page render one confirmation dialog. */
export const createRemovalSlice: UiSliceCreator<RemovalSlice> = (set) => ({
  pendingRemoval: null,

  requestRemoval: (target) =>
    set(
      (state) => {
        state.pendingRemoval = target;
      },
      false,
      'removal/request'
    ),

  cancelRemoval: () =>
    set(
      (state) => {
        state.pendingRemoval = null;
      },
      false,
      'removal/cancel'
    ),
});

export interface DevControlsSlice {
  /** Forces the next watchlist write to fail, so rollback can be demonstrated. */
  simulateWriteFailure: boolean;
  setSimulateWriteFailure: (value: boolean) => void;
}

export const createDevControlsSlice: UiSliceCreator<DevControlsSlice> = (
  set
) => ({
  simulateWriteFailure: false,

  setSimulateWriteFailure: (value) =>
    set(
      (state) => {
        state.simulateWriteFailure = value;
      },
      false,
      'devControls/setSimulateWriteFailure'
    ),
});

export interface UiState
  extends SearchInputSlice,
    ThemeSlice,
    RemovalSlice,
    DevControlsSlice {}
