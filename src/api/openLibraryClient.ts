import { config } from '../config.js';

/** Normalized book result from Open Library search. */
export interface BookSearchResult {
  id: string;
  title: string;
  author?: string;
  publishYear?: number;
  genre?: string;
}

/** Shape of one document in Open Library search response. */
interface OpenLibraryDoc {
  key?: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  subject?: string[];
}

interface OpenLibrarySearchResponse {
  docs?: OpenLibraryDoc[];
}

export class OpenLibraryError extends Error {
  readonly causeDetail?: unknown;

  constructor(message: string, causeDetail?: unknown) {
    super(message);
    this.name = 'OpenLibraryError';
    this.causeDetail = causeDetail;
  }
}

function buildSearchUrl(baseUrl: string, path: string, query: string, limit: number): string {
  // Absolute paths (starting with /) replace the base URL path — fine for openlibrary.org root.
  // TMDB uses a relative path + trailing slash base instead; see config.tmdbBaseUrl.
  const url = new URL(path, baseUrl);
  url.searchParams.set('q', query.trim());
  url.searchParams.set('limit', String(limit));
  return url.toString();
}

function mapDocToResult(doc: OpenLibraryDoc): BookSearchResult | null {
  if (!doc.key || !doc.title) {
    return null;
  }

  const result: BookSearchResult = {
    id: doc.key.replace(/^\//, ''),
    title: doc.title,
  };

  const author = doc.author_name?.[0];
  if (author) {
    result.author = author;
  }

  if (doc.first_publish_year !== undefined) {
    result.publishYear = doc.first_publish_year;
  }

  const genre = doc.subject?.[0];
  if (genre) {
    result.genre = genre;
  }

  return result;
}

/**
 * Search books by title via the free Open Library API.
 * Uses async/await with explicit error handling — no silent failures.
 */
export async function searchBooks(
  query: string,
  options: {
    limit?: number;
    baseUrl?: string;
    searchPath?: string;
    signal?: AbortSignal;
  } = {}
): Promise<BookSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new OpenLibraryError('Search query cannot be empty');
  }

  const limit = options.limit ?? 10;
  const baseUrl = options.baseUrl ?? config.openLibraryBaseUrl;
  const searchPath = options.searchPath ?? config.openLibrarySearchPath;
  const url = buildSearchUrl(baseUrl, searchPath, trimmed, limit);

  let response: Response;
  try {
    const init: RequestInit = {};
    if (options.signal) {
      init.signal = options.signal;
    }
    response = await fetch(url, init);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    throw new OpenLibraryError('Network request to Open Library failed', error);
  }

  if (!response.ok) {
    throw new OpenLibraryError(
      `Open Library returned HTTP ${response.status} for search query`
    );
  }

  let payload: OpenLibrarySearchResponse;
  try {
    payload = (await response.json()) as OpenLibrarySearchResponse;
  } catch (error) {
    throw new OpenLibraryError('Failed to parse Open Library response as JSON', error);
  }

  const docs = payload.docs ?? [];
  return docs
    .map(mapDocToResult)
    .filter((result): result is BookSearchResult => result !== null);
}
