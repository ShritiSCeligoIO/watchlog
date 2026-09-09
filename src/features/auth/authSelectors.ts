import type { RootState } from '../../store/rootReducer';

export const selectIsAuthenticated = (state: RootState): boolean =>
  state.auth.isAuthenticated;
