import type { BookSearchResult } from '../../api/openLibraryClient.js';
import type { MovieSearchResult } from '../../api/tmdbClient.js';

export type SearchMediaType = 'book' | 'movie';

export type MediaSearchResult = BookSearchResult | MovieSearchResult;
