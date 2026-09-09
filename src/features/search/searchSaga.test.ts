import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import type { StaticProvider } from 'redux-saga-test-plan/providers';
import { delay } from 'redux-saga/effects';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenLibraryError, searchBooks } from '../../api/openLibraryClient.js';
import { isMovieSearchConfigured } from '../../config.js';
import { rootReducer } from '../../store/rootReducer';
import { runSearch, watchSearch } from './searchSaga';
import {
  searchCleared,
  searchFailed,
  searchQueryChanged,
  searchStarted,
  searchSucceeded,
  type SearchMediaType,
  type SearchState,
} from './searchSlice';

vi.mock('../../api/openLibraryClient.js', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../api/openLibraryClient.js')>();
  return { ...actual, searchBooks: vi.fn() };
});

vi.mock('../../api/tmdbClient.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api/tmdbClient.js')>();
  return { ...actual, searchMovies: vi.fn() };
});

vi.mock('../../config.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../config.js')>();
  return { ...actual, isMovieSearchConfigured: vi.fn(() => true) };
});

// Skip real debounce and backoff timers while preserving their saga effects.
const delayFunction = (
  delay(0) as unknown as { payload: { fn: () => unknown } }
).payload.fn;
const skipDelays: StaticProvider = [
  matchers.call.fn(delayFunction),
  null,
];

const bookResults = [{ id: 'works/OL1W', title: 'Dune' }];

function stateWith(overrides: Partial<SearchState> = {}) {
  return {
    search: {
      mediaType: 'book',
      query: 'dune',
      results: [],
      loading: false,
      error: null,
      ...overrides,
    } satisfies SearchState,
  };
}

beforeEach(() => {
  vi.mocked(isMovieSearchConfigured).mockReturnValue(true);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('search saga', () => {
  it('dispatches loading and success around a search', async () => {
    vi.mocked(searchBooks).mockResolvedValue(bookResults);

    await expectSaga(runSearch)
      .withState(stateWith())
      .provide([skipDelays])
      .put(searchStarted())
      .put(searchSucceeded(bookResults))
      .run();

    expect(searchBooks).toHaveBeenCalledWith(
      'dune',
      expect.objectContaining({ signal: expect.anything() })
    );
  });

  it('debounces changes and keeps only the latest result', async () => {
    const latestResults = [{ id: 'works/OL2W', title: 'Dune Messiah' }];
    vi.mocked(searchBooks)
      .mockImplementationOnce(() => new Promise(() => {}))
      .mockResolvedValueOnce(latestResults);

    const { storeState } = await expectSaga(watchSearch)
      .withReducer(rootReducer)
      .provide([skipDelays])
      .dispatch(searchQueryChanged('dune'))
      .dispatch(searchQueryChanged('dune messiah'))
      .silentRun(50);

    expect(storeState.search.results).toEqual(latestResults);
  });

  it('aborts the API signal when takeLatest cancels the task', () => {
    const generator = runSearch();

    generator.next();
    generator.next();
    generator.next({ mediaType: 'book' as SearchMediaType, query: 'dune' });
    const callEffect = generator.next();
    const signal = (
      callEffect.value as {
        payload: { args: [SearchMediaType, string, AbortSignal] };
      }
    ).payload.args[2];

    generator.return(undefined);
    generator.next(true);

    expect(signal.aborted).toBe(true);
  });

  it('retries a transient error and then succeeds', async () => {
    const transientError = new OpenLibraryError('Temporary failure', undefined, {
      retryable: true,
    });
    vi.mocked(searchBooks)
      .mockRejectedValueOnce(transientError)
      .mockResolvedValueOnce(bookResults);

    await expectSaga(runSearch)
      .withState(stateWith())
      .provide([skipDelays])
      .put(searchSucceeded(bookResults))
      .run();

    expect(searchBooks).toHaveBeenCalledTimes(2);
  });

  it('does not retry an HTTP 4xx client error', async () => {
    const clientError = new OpenLibraryError('HTTP 404', undefined, {
      status: 404,
      retryable: false,
    });
    vi.mocked(searchBooks).mockRejectedValue(clientError);

    await expectSaga(runSearch)
      .withState(stateWith())
      .provide([skipDelays])
      .put(searchFailed('HTTP 404'))
      .run();

    expect(searchBooks).toHaveBeenCalledOnce();
  });

  it('does not call the API when movie search is unconfigured', async () => {
    vi.mocked(isMovieSearchConfigured).mockReturnValue(false);

    await expectSaga(runSearch)
      .withState(stateWith({ mediaType: 'movie' }))
      .provide([skipDelays])
      .put(searchCleared())
      .run();

    expect(searchBooks).not.toHaveBeenCalled();
  });
});
