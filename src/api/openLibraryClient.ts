import { config } from '../config.js';

export interface BookSearchResult {
  id: string;
  title: string;
  author?: string;
  publishYear?: number;
  genre?: string;
}

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

function buildSearchUrl(
  baseUrl: string,
  path: string,
  query: string,
  limit: number
): string {
  const url = new URL(path, baseUrl);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', String(limit));
  return url.toString();
}

function mapDocToResult(doc: OpenLibraryDoc): BookSearchResult | null {
  if (typeof doc.key !== 'string' || typeof doc.title !== 'string') {
    return null;
  }

  const result: BookSearchResult = {
    id: doc.key.replace(/^\//, ''),
    title: doc.title,
  };

  const author = Array.isArray(doc.author_name) ? doc.author_name[0] : undefined;
  if (typeof author === 'string') {
    result.author = author;
  }

  if (typeof doc.first_publish_year === 'number') {
    result.publishYear = doc.first_publish_year;
  }

  const genre = Array.isArray(doc.subject) ? doc.subject[0] : undefined;
  if (typeof genre === 'string') {
    result.genre = genre;
  }

  return result;
}

function readDocs(payload: unknown): OpenLibraryDoc[] {
  if (typeof payload !== 'object' || payload === null) {
    throw new OpenLibraryError('Open Library returned an invalid response');
  }

  const docs = (payload as OpenLibrarySearchResponse).docs;
  if (docs === undefined) {
    return [];
  }
  if (!Array.isArray(docs)) {
    throw new OpenLibraryError('Open Library returned an invalid response');
  }

  return docs.filter(
    (doc): doc is OpenLibraryDoc => typeof doc === 'object' && doc !== null
  );
}

/** Search books by title with the Open Library API. */
export async function searchBooks(
  query: string,
  options: { limit?: number; baseUrl?: string; searchPath?: string } = {}
): Promise<BookSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new OpenLibraryError('Search query cannot be empty');
  }

  const limit = options.limit ?? 10;
  if (!Number.isInteger(limit) || limit < 1) {
    throw new OpenLibraryError('Search limit must be a positive integer');
  }

  const baseUrl = options.baseUrl ?? config.openLibraryBaseUrl;
  const searchPath = options.searchPath ?? config.openLibrarySearchPath;
  const url = buildSearchUrl(baseUrl, searchPath, trimmed, limit);

  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw new OpenLibraryError('Network request to Open Library failed', error);
  }

  if (!response.ok) {
    throw new OpenLibraryError(
      `Open Library returned HTTP ${response.status} for search query`
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    throw new OpenLibraryError('Failed to parse Open Library response as JSON', error);
  }

  return readDocs(payload)
    .map(mapDocToResult)
    .filter((result): result is BookSearchResult => result !== null);
}
