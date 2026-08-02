import type { BookSearchResult } from '../api/openLibraryClient.js';
import type { MovieSearchResult } from '../api/tmdbClient.js';
import type {
  BookWatchlistItem,
  MovieWatchlistItem,
} from '../types/watchlistItem.js';

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function watchlistIdForBookSearch(result: BookSearchResult): string {
  return `book-search-${result.id}`;
}

export function watchlistIdForMovieSearch(result: MovieSearchResult): string {
  return `movie-search-${result.id}`;
}

export function bookSearchResultToWatchlistItem(
  result: BookSearchResult
): BookWatchlistItem {
  const item: BookWatchlistItem = {
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
): MovieWatchlistItem {
  const item: MovieWatchlistItem = {
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
