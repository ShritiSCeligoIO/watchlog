import '@testing-library/jest-dom';
import { resetWatchlistStore } from './src/features/watchlist/watchlistApi.js';
import { server } from './src/testing/msw/server.js';

const mutableEnv = process.env as Record<string, string | undefined>;
mutableEnv.TMDB_API_KEY = 'test-tmdb-key';
mutableEnv.OPEN_LIBRARY_BASE_URL = 'https://openlibrary.org';

if (typeof Element !== 'undefined') {
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.setPointerCapture ??= () => undefined;
  Element.prototype.releasePointerCapture ??= () => undefined;
  Element.prototype.scrollIntoView ??= () => undefined;
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  globalThis.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  })) as unknown as typeof matchMedia;
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
beforeEach(() => resetWatchlistStore());
