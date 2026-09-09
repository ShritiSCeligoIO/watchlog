function readEnvironmentVariable(name: string): string | undefined {
  const browserEnvironment = (
    import.meta as ImportMeta & {
      env?: Record<string, string | undefined>;
    }
  ).env;

  if (browserEnvironment?.[name]) {
    return browserEnvironment[name];
  }

  if (typeof process !== 'undefined') {
    return process.env[name];
  }

  return undefined;
}

export const config = {
  openLibraryBaseUrl:
    readEnvironmentVariable('OPEN_LIBRARY_BASE_URL') ??
    'https://openlibrary.org',
  openLibrarySearchPath: '/search.json',
  tmdbApiKey: readEnvironmentVariable('TMDB_API_KEY') ?? '',
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

/** Tell the browser UI whether movie search is available. */
export function isMovieSearchConfigured(): boolean {
  return config.tmdbApiKey.length > 0;
}
