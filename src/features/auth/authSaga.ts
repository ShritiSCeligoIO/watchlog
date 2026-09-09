import { call, takeEvery } from 'redux-saga/effects';
import { AUTH_SESSION_KEY, loggedIn, loggedOut } from './authSlice';

function writeAuthSession(): void {
  window.sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
}

function clearAuthSession(): void {
  window.sessionStorage.removeItem(AUTH_SESSION_KEY);
}

/** Persistence lives here so the reducers stay pure. */
export function* persistLogin(): Generator<unknown, void, unknown> {
  yield call(writeAuthSession);
}

export function* persistLogout(): Generator<unknown, void, unknown> {
  yield call(clearAuthSession);
}

export function* watchAuth(): Generator<unknown, void, unknown> {
  yield takeEvery(loggedIn.type, persistLogin);
  yield takeEvery(loggedOut.type, persistLogout);
}
