import { config } from '../config.js';

/** Normalized movie result from TMDB search. */
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

/** TMDB genre id → name (subset of official movie genre list). */
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

  constructor(message: string, causeDetail?: unknown) {
    super(message);
    this.name = 'TmdbError';
    this.causeDetail = causeDetail;
  }
}

function buildSearchUrl(
  baseUrl: string,
  path: string,
  query: string,
  apiKey: string
): string {
  // Use a relative path (no leading slash) with a trailing-slash base URL
  // so the /3/ segment is preserved — see config.tmdbBaseUrl.
  const url = new URL(path, baseUrl);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('query', query.trim());
  url.searchParams.set('language', 'en-US');
  url.searchParams.set('page', '1');
  return url.toString();
}

function parseReleaseYear(releaseDate?: string): number | undefined {
  if (!releaseDate) {
    return undefined;
  }

  const year = Number(releaseDate.slice(0, 4));
  return Number.isFinite(year) ? year : undefined;
}

function mapDocToResult(doc: TmdbMovieDoc): MovieSearchResult | null {
  if (doc.id === undefined || !doc.title) {
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

  const primaryGenreId = doc.genre_ids?.[0];
  if (primaryGenreId !== undefined) {
    const genreName = TMDB_GENRE_NAMES[primaryGenreId];
    if (genreName) {
      result.genre = genreName;
    }
  }

  return result;
}

/**
 * Search movies by title via the TMDB API.
 * Requires TMDB_API_KEY in the environment (see config.ts).
 */
export async function searchMovies(
  query: string,
  options: { limit?: number; apiKey?: string; baseUrl?: string; searchPath?: string } = {}
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
  const baseUrl = options.baseUrl ?? config.tmdbBaseUrl;
  const searchPath = options.searchPath ?? config.tmdbSearchMoviePath;
  const url = buildSearchUrl(baseUrl, searchPath, trimmed, apiKey);

  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw new TmdbError('Network request to TMDB failed', error);
  }

  if (!response.ok) {
    throw new TmdbError(`TMDB returned HTTP ${response.status} for search query`);
  }

  let payload: TmdbSearchResponse;
  try {
    payload = (await response.json()) as TmdbSearchResponse;
  } catch (error) {
    throw new TmdbError('Failed to parse TMDB response as JSON', error);
  }

  const results = payload.results ?? [];
  return results
    .map(mapDocToResult)
    .filter((result): result is MovieSearchResult => result !== null)
    .slice(0, limit);
}
