import { http, HttpResponse } from 'msw';
import { OpenLibraryError, searchBooks } from './openLibraryClient.js';
import { searchMovies, TmdbError } from './tmdbClient.js';
import {
  OPEN_LIBRARY_SEARCH_URL,
  TMDB_SEARCH_URL,
  openLibraryFailure,
} from '../testing/msw/handlers.js';
import { server } from '../testing/msw/server.js';

describe('search API clients', () => {
  it('maps realistic Open Library data and URL parameters', async () => {
    let requestUrl = '';
    server.use(
      http.get(OPEN_LIBRARY_SEARCH_URL, ({ request }) => {
        requestUrl = request.url;
        return HttpResponse.json({
          docs: [
            {
              key: '/works/OL893415W',
              title: 'Dune',
              author_name: ['Frank Herbert'],
              first_publish_year: 1965,
              subject: ['Science Fiction'],
            },
            { key: '/works/missing-title' },
          ],
        });
      })
    );

    await expect(searchBooks('  dune  ', { limit: 3 })).resolves.toEqual([
      {
        id: 'works/OL893415W',
        title: 'Dune',
        author: 'Frank Herbert',
        publishYear: 1965,
        genre: 'Science Fiction',
      },
    ]);
    expect(requestUrl).toContain('q=dune');
    expect(requestUrl).toContain('limit=3');
  });

  it('classifies Open Library validation and HTTP errors', async () => {
    await expect(searchBooks(' ')).rejects.toThrow('cannot be empty');
    await expect(searchBooks('dune', { limit: 0 })).rejects.toThrow(
      'positive integer'
    );
    server.use(openLibraryFailure(503));
    await expect(searchBooks('dune')).rejects.toMatchObject({
      name: OpenLibraryError.name,
      status: 503,
      retryable: true,
    });
  });

  it('maps and limits realistic TMDB results', async () => {
    const results = await searchMovies('dune', { apiKey: 'test-key', limit: 1 });

    expect(results).toEqual([
      {
        id: '438631',
        title: 'Dune',
        releaseYear: 2021,
        genre: 'Science Fiction',
      },
    ]);
  });

  it('validates TMDB configuration and classifies client errors', async () => {
    await expect(searchMovies(' ', { apiKey: 'key' })).rejects.toThrow(
      'cannot be empty'
    );
    await expect(searchMovies('dune', { apiKey: '' })).rejects.toThrow(
      'not configured'
    );
    server.use(
      http.get(TMDB_SEARCH_URL, () =>
        HttpResponse.json({ status_message: 'No access' }, { status: 401 })
      )
    );
    await expect(
      searchMovies('dune', { apiKey: 'bad-key' })
    ).rejects.toMatchObject({
      name: TmdbError.name,
      status: 401,
      retryable: false,
    });
  });
});
