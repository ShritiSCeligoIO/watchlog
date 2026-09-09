import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { applyTheme } from '../lib/theme';
import {
  createDevControlsSlice,
  createRemovalSlice,
  createSearchInputSlice,
  createThemeSlice,
  type UiState,
} from './uiSlice';

// UI-owned state only. Server data belongs in the query cache.
export const useUiStore = create<UiState>()(
  devtools(
    persist(
      immer((...args) => ({
        ...createSearchInputSlice(...args),
        ...createThemeSlice(...args),
        ...createRemovalSlice(...args),
        ...createDevControlsSlice(...args),
      })),
      {
        name: 'watchlog_ui',
        // Only the theme should survive a reload.
        partialize: (state) => ({ theme: state.theme }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            applyTheme(state.theme);
          }
        },
      }
    ),
    { name: 'WatchLog UI' }
  )
);
