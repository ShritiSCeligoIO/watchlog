import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { seedWatchlist } from '../../fixtures/seedWatchlist.js';
import type {
  WatchlistItem,
  WatchlistItemUpdate,
} from '../../types/watchlistItem.js';
import { applyWatchlistItemUpdate } from '../../types/watchlistItem.js';

export interface WatchlistState {
  items: WatchlistItem[];
}

const initialState: WatchlistState = {
  items: seedWatchlist,
};

/** Immer lets these reducers read like direct updates while staying immutable. */
const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<WatchlistItem>) {
      const alreadyPresent = state.items.some(
        (item) => item.id === action.payload.id
      );
      if (alreadyPresent) {
        return;
      }
      state.items.push(action.payload);
    },

    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    updateItem(
      state,
      action: PayloadAction<{ id: string; update: WatchlistItemUpdate }>
    ) {
      const index = state.items.findIndex(
        (item) => item.id === action.payload.id
      );
      if (index === -1) {
        return;
      }

      const item = state.items[index];
      if (!item) {
        return;
      }

      state.items[index] = applyWatchlistItemUpdate(
        item,
        action.payload.update
      );
    },
  },
});

export const { addItem, removeItem, updateItem } = watchlistSlice.actions;

export default watchlistSlice.reducer;
