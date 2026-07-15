import type { WatchlistItem } from '../types/watchlistItem.js';

/** Realistic mixed watchlist used across utility tests. */
export const mockWatchlist: WatchlistItem[] = [
  {
    id: 'movie-1',
    type: 'movie',
    title: 'Arrival',
    genre: 'Science Fiction',
    status: 'done',
    dateAdded: '2026-01-10',
    rating: 5,
    director: 'Denis Villeneuve',
    releaseYear: 2016,
  },
  {
    id: 'book-1',
    type: 'book',
    title: 'Project Hail Mary',
    genre: 'Science Fiction',
    status: 'watching',
    dateAdded: '2026-02-01',
    author: 'Andy Weir',
    publishYear: 2021,
  },
  {
    id: 'movie-2',
    type: 'movie',
    title: 'The Grand Budapest Hotel',
    genre: 'Comedy',
    status: 'done',
    dateAdded: '2026-01-20',
    rating: 4,
    director: 'Wes Anderson',
    releaseYear: 2014,
  },
  {
    id: 'book-2',
    type: 'book',
    title: 'Dune',
    genre: 'Science Fiction',
    status: 'want',
    dateAdded: '2026-03-05',
    author: 'Frank Herbert',
    publishYear: 1965,
  },
  {
    id: 'movie-3',
    type: 'movie',
    title: 'Parasite',
    genre: 'Thriller',
    status: 'want',
    dateAdded: '2026-03-12',
    director: 'Bong Joon-ho',
    releaseYear: 2019,
  },
];

export const emptyWatchlist: WatchlistItem[] = [];
