import dotenv from 'dotenv';

dotenv.config();

export const config = {
  openLibraryBaseUrl:
    process.env.OPEN_LIBRARY_BASE_URL ?? 'https://openlibrary.org',
  openLibrarySearchPath: '/search.json',
  tmdbApiKey: process.env.TMDB_API_KEY ?? '',
  tmdbBaseUrl: 'https://api.themoviedb.org/3/',
  tmdbSearchMoviePath: 'search/movie',
} as const;

/**
 * Call at application startup when movie search is enabled.
 * The application can catch and log this structured message with its logger.
 */
export function validateMovieSearchConfig(
  tmdbApiKey: string = config.tmdbApiKey
): void {
  if (!tmdbApiKey) {
    throw new Error('logName=requiredEnvVarMissing, envVar=TMDB_API_KEY');
  }
}
