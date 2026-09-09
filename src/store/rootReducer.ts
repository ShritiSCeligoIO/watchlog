import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import searchReducer from '../features/search/searchSlice';
import watchlistReducer from '../features/watchlist/watchlistSlice';

/**
 * Kept separate from the store so `RootState` can be derived from the reducers
 * alone. Deriving it from `store.getState` instead would make every selector
 * that annotates `RootState` part of the store's own type inference.
 */
export const rootReducer = combineReducers({
  auth: authReducer,
  search: searchReducer,
  watchlist: watchlistReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
