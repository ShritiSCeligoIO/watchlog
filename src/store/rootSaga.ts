import { all, fork } from 'redux-saga/effects';
import { watchAuth } from '../features/auth/authSaga';
import { watchSearch } from '../features/search/searchSaga';

/** Start both long-running watchers together. */
export function* rootSaga(): Generator<unknown, void, unknown> {
  yield all([fork(watchSearch), fork(watchAuth)]);
}
