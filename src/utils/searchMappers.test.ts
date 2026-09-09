import {
  bookSearchResultToWatchlistItem,
  movieSearchResultToWatchlistItem,
  watchlistIdForBookSearch,
  watchlistIdForMovieSearch,
} from './searchMappers.js';

describe('search result mappers', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-21T12:00:00Z'));
  });
  afterEach(() => jest.useRealTimers());

  it('maps realistic book data and produces a URL-safe id', () => {
    expect(
      bookSearchResultToWatchlistItem({
        id: 'works/OL1W',
        title: 'Dune',
        author: 'Frank Herbert',
        publishYear: 1965,
        genre: 'Science Fiction',
      })
    ).toEqual({
      id: 'book-search-works-OL1W',
      type: 'book',
      title: 'Dune',
      author: 'Frank Herbert',
      publishYear: 1965,
      genre: 'Science Fiction',
      status: 'want',
      dateAdded: '2026-07-21',
    });
  });

  it('omits absent optional fields and supplies an unknown genre', () => {
    const book = bookSearchResultToWatchlistItem({
      id: 'works/unknown',
      title: 'Unknown Book',
    });
    const movie = movieSearchResultToWatchlistItem({
      id: '438631',
      title: 'Dune',
    });

    expect(book).not.toHaveProperty('author');
    expect(book.genre).toBe('Unknown');
    expect(movie).not.toHaveProperty('releaseYear');
    expect(movie.genre).toBe('Unknown');
  });

  it('keeps search ids safe as one URL segment', () => {
    const bookId = watchlistIdForBookSearch({
      id: 'works/OL 1W?edition=#1',
      title: 'Book',
    });
    expect(encodeURIComponent(bookId)).toBe(bookId);
    expect(
      watchlistIdForMovieSearch({ id: '438631', title: 'Dune' })
    ).toBe('movie-search-438631');
  });
});
