import { config } from '../config.js';
import { isAbortError } from './isRetryableError.js';

export interface MovieSearchResult {
  id: string;
  title: string;
  releaseYear?: number;
  genre?: string;
}

interface TmdbMovieDoc {
  id?: number;
  title?: string;
  release_date?: string;
  genre_ids?: number[];
}

interface TmdbSearchResponse {
  results?: TmdbMovieDoc[];
}

const TMDB_GENRE_NAMES: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

export class TmdbError extends Error {
  readonly causeDetail?: unknown;
  readonly retryable: boolean;
  readonly status?: number;

  constructor(
    message: string,
    causeDetail?: unknown,
    options: { retryable?: boolean; status?: number } = {}
  ) {
    super(message);
    this.name = 'TmdbError';
    this.causeDetail = causeDetail;
    this.retryable = options.retryable ?? false;
    if (options.status !== undefined) {
      this.status = options.status;
    }
  }
}

function buildSearchUrl(
  baseUrl: string,
  path: string,
  query: string,
  apiKey: string
): string {
  const url = new URL(path, baseUrl);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('query', query);
  url.searchParams.set('language', 'en-US');
  url.searchParams.set('page', '1');
  return url.toString();
}

function parseReleaseYear(releaseDate: unknown): number | undefined {
  if (typeof releaseDate !== 'string') {
    return undefined;
  }

  const year = Number(releaseDate.slice(0, 4));
  return Number.isFinite(year) ? year : undefined;
}

function mapDocToResult(doc: TmdbMovieDoc): MovieSearchResult | null {
  if (typeof doc.id !== 'number' || typeof doc.title !== 'string') {
    return null;
  }

  const result: MovieSearchResult = {
    id: String(doc.id),
    title: doc.title,
  };

  const releaseYear = parseReleaseYear(doc.release_date);
  if (releaseYear !== undefined) {
    result.releaseYear = releaseYear;
  }

  const primaryGenreId = Array.isArray(doc.genre_ids) ? doc.genre_ids[0] : undefined;
  if (typeof primaryGenreId === 'number') {
    const genreName = TMDB_GENRE_NAMES[primaryGenreId];
    if (genreName) {
      result.genre = genreName;
    }
  }

  return result;
}

function readResults(payload: unknown): TmdbMovieDoc[] {
  if (typeof payload !== 'object' || payload === null) {
    throw new TmdbError('TMDB returned an invalid response');
  }

  const results = (payload as TmdbSearchResponse).results;
  if (results === undefined) {
    return [];
  }
  if (!Array.isArray(results)) {
    throw new TmdbError('TMDB returned an invalid response');
  }

  return results.filter(
    (result): result is TmdbMovieDoc =>
      typeof result === 'object' && result !== null
  );
}

/** Search movies by title with the TMDB API. */
export async function searchMovies(
  query: string,
  options: {
    limit?: number;
    apiKey?: string;
    baseUrl?: string;
    searchPath?: string;
    signal?: AbortSignal;
  } = {}
): Promise<MovieSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new TmdbError('Search query cannot be empty');
  }

  const apiKey = options.apiKey ?? config.tmdbApiKey;
  if (!apiKey) {
    throw new TmdbError(
      'TMDB API key is not configured. Set TMDB_API_KEY in your environment.'
    );
  }

  const limit = options.limit ?? 10;
  if (!Number.isInteger(limit) || limit < 1) {
    throw new TmdbError('Search limit must be a positive integer');
  }

  const baseUrl = options.baseUrl ?? config.tmdbBaseUrl;
  const searchPath = options.searchPath ?? config.tmdbSearchMoviePath;
  const url = buildSearchUrl(baseUrl, searchPath, trimmed, apiKey);

  let response: Response;
  try {
    response = options.signal
      ? await fetch(url, { signal: options.signal })
      : await fetch(url);
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    throw new TmdbError('Network request to TMDB failed', error, {
      retryable: true,
    });
  }

  if (!response.ok) {
    throw new TmdbError(
      `TMDB returned HTTP ${response.status} for search query`,
      undefined,
      { status: response.status, retryable: response.status >= 500 }
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    throw new TmdbError('Failed to parse TMDB response as JSON', error);
  }

  return readResults(payload)
    .map(mapDocToResult)
    .filter((result): result is MovieSearchResult => result !== null)
    .slice(0, limit);
}
