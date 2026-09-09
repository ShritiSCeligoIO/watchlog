import { createSlice } from '@reduxjs/toolkit';

export const AUTH_SESSION_KEY = 'watchlog_authenticated';

export interface AuthState {
  isAuthenticated: boolean;
}

function readAuthSession(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.sessionStorage.getItem(AUTH_SESSION_KEY) === 'true';
}

const initialState: AuthState = {
  isAuthenticated: readAuthSession(),
};

/** Mock auth only — enough to demonstrate a route guard, not real security. */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loggedIn(state) {
      state.isAuthenticated = true;
    },
    loggedOut(state) {
      state.isAuthenticated = false;
    },
  },
});

export const { loggedIn, loggedOut } = authSlice.actions;

export default authSlice.reducer;
