import {
  call,
  cancelled,
  delay,
  put,
  select,
  takeLatest,
} from 'redux-saga/effects';
import { searchBooks } from '../../api/openLibraryClient.js';
import { searchMovies } from '../../api/tmdbClient.js';
import { isMovieSearchConfigured } from '../../config.js';
import { MIN_SEARCH_QUERY_LENGTH } from '../../constants/search.js';
import {
  isRetryableSearchError,
  toSearchErrorMessage,
} from './isRetryableSearchError';
import { selectSearchInput } from './searchSelectors';
import {
  searchCleared,
  searchFailed,
  searchMediaTypeChanged,
  searchQueryChanged,
  searchStarted,
  searchSucceeded,
  type MediaSearchResult,
  type SearchMediaType,
} from './searchSlice';

/** Wait this long after the last keystroke before hitting the network. */
export const SEARCH_DEBOUNCE_MS = 300;

/** Attempts after the first one, for transient failures only. */
export const MAX_SEARCH_RETRIES = 2;

export const RETRY_BACKOFF_MS = 300;

/** Retry only transient errors; the delay remains cancellable by takeLatest. */
export function* searchWithRetry(
  mediaType: SearchMediaType,
  query: string,
  signal: AbortSignal
): Generator<unknown, MediaSearchResult[], unknown> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      if (mediaType === 'book') {
        return (yield call(searchBooks, query, { signal })) as MediaSearchResult[];
      }
      return (yield call(searchMovies, query, { signal })) as MediaSearchResult[];
    } catch (error) {
      if (attempt >= MAX_SEARCH_RETRIES || !isRetryableSearchError(error)) {
        throw error;
      }
      yield delay(RETRY_BACKOFF_MS * 2 ** attempt);
    }
  }
}

/** Saga cancellation stops the task; AbortController also stops its fetch. */
export function* runSearch(): Generator<unknown, void, unknown> {
  const controller = new AbortController();

  try {
    yield delay(SEARCH_DEBOUNCE_MS);

    const { mediaType, query } = (yield select(selectSearchInput)) as {
      mediaType: SearchMediaType;
      query: string;
    };
    const trimmed = query.trim();

    if (trimmed.length < MIN_SEARCH_QUERY_LENGTH) {
      yield put(searchCleared());
      return;
    }

    if (mediaType === 'movie' && !isMovieSearchConfigured()) {
      yield put(searchCleared());
      return;
    }

    yield put(searchStarted());

    const results = (yield call(
      searchWithRetry,
      mediaType,
      trimmed,
      controller.signal
    )) as MediaSearchResult[];

    yield put(searchSucceeded(results));
  } catch (error) {
    yield put(searchFailed(toSearchErrorMessage(error)));
  } finally {
    if (yield cancelled()) {
      controller.abort();
    }
  }
}

export function* watchSearch(): Generator<unknown, void, unknown> {
  yield takeLatest(
    [searchQueryChanged.type, searchMediaTypeChanged.type],
    runSearch
  );
}
