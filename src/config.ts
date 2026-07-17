/** Central config — all env reads live here. */
import dotenv from 'dotenv';

dotenv.config();

const openLibraryBaseUrl =
  process.env.OPEN_LIBRARY_BASE_URL ?? 'https://openlibrary.org';

/** Required for TMDB movie search — get a free key at https://www.themoviedb.org/settings/api */
const tmdbApiKey = process.env.TMDB_API_KEY ?? '';

export const config = {
  openLibraryBaseUrl,
  openLibrarySearchPath: '/search.json',
  tmdbApiKey,
  tmdbBaseUrl: 'https://api.themoviedb.org/3/',
  tmdbSearchMoviePath: 'search/movie',
} as const;

/**
 * Validates env vars required for movie search.
 * Call from a future app entry point (Stage 2+) before serving traffic.
 * Utils and book search work without this.
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
