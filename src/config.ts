/**
 * Central config — all env reads live here.
 * Browser: Vite exposes VITE_* via import.meta.env (no dotenv in the bundle).
 * Node/tests: process.env, loaded from .env via vitest.setup.ts.
 */

function readEnv(viteKey: string, nodeKey: string): string | undefined {
  const meta = (import.meta as ImportMeta & {
    env?: Record<string, string | undefined>;
  }).env;

  if (meta?.[viteKey]) {
    return meta[viteKey];
  }
  // Browser: Vite envPrefix includes TMDB_ when VITE_* is unset
  if (meta?.[nodeKey]) {
    return meta[nodeKey];
  }

  if (typeof process !== 'undefined' && process.env?.[nodeKey]) {
    return process.env[nodeKey];
  }
  if (typeof process !== 'undefined' && process.env?.[viteKey]) {
    return process.env[viteKey];
  }

  return undefined;
}

const openLibraryBaseUrl =
  readEnv('VITE_OPEN_LIBRARY_BASE_URL', 'OPEN_LIBRARY_BASE_URL') ??
  'https://openlibrary.org';

/** Required for TMDB movie search in Node scripts; use VITE_TMDB_API_KEY in the browser. */
const tmdbApiKey =
  readEnv('VITE_TMDB_API_KEY', 'TMDB_API_KEY') ?? '';

export const config = {
  openLibraryBaseUrl,
  openLibrarySearchPath: '/search.json',
  tmdbApiKey,
  tmdbBaseUrl: 'https://api.themoviedb.org/3/',
  tmdbSearchMoviePath: 'search/movie',
} as const;

/**
 * Validates env vars required for movie search (Node / scripts).
 * Call from CLI entry points — not from the browser bundle.
 */
export function validateMovieSearchConfig(
  options: { tmdbApiKey?: string } = {}
): void {
  const apiKey = options.tmdbApiKey ?? config.tmdbApiKey;
  if (apiKey) {
    return;
  }

  console.error('logName=requiredEnvVarMissing, envVar=TMDB_API_KEY');
  process.exit(1);
}

/** Browser-safe check — logs and returns false instead of exiting. */
export function isMovieSearchConfigured(): boolean {
  return Boolean(config.tmdbApiKey);
}

export function warnIfMovieSearchUnavailable(): void {
  if (isMovieSearchConfigured()) {
    return;
  }

  console.warn(
    'logName=movieSearchUnavailable, message=Set TMDB_API_KEY or VITE_TMDB_API_KEY in .env at the repo root for movie search'
  );
}
