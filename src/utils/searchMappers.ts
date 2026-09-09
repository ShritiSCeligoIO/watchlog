import type { BookSearchResult } from '../api/openLibraryClient.js';
import type { MovieSearchResult } from '../api/tmdbClient.js';
import type { BookItem, MovieItem } from '../types/watchlistItem.js';

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

const UNSAFE_PATH_CHARACTERS = /[^A-Za-z0-9._~-]+/g;

function toPathSegment(id: string): string {
  return id.replace(UNSAFE_PATH_CHARACTERS, '-');
}

export function watchlistIdForBookSearch(result: BookSearchResult): string {
  return `book-search-${toPathSegment(result.id)}`;
}

export function watchlistIdForMovieSearch(result: MovieSearchResult): string {
  return `movie-search-${toPathSegment(result.id)}`;
}

export function bookSearchResultToWatchlistItem(
  result: BookSearchResult
): BookItem {
  const item: BookItem = {
    id: watchlistIdForBookSearch(result),
    type: 'book',
    title: result.title,
    genre: result.genre ?? 'Unknown',
    status: 'want',
    dateAdded: todayIsoDate(),
  };

  if (result.author) {
    item.author = result.author;
  }
  if (result.publishYear !== undefined) {
    item.publishYear = result.publishYear;
  }

  return item;
}

export function movieSearchResultToWatchlistItem(
  result: MovieSearchResult
): MovieItem {
  const item: MovieItem = {
    id: watchlistIdForMovieSearch(result),
    type: 'movie',
    title: result.title,
    genre: result.genre ?? 'Unknown',
    status: 'want',
    dateAdded: todayIsoDate(),
  };

  if (result.releaseYear !== undefined) {
    item.releaseYear = result.releaseYear;
  }

  return item;
}
