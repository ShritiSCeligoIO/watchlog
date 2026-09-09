import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchMovies, TmdbError } from './tmdbClient.js';

const TEST_API_KEY = 'test-tmdb-api-key';

describe('searchMovies', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requests TMDB and maps valid results', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 438631,
            title: 'Dune',
            release_date: '2021-09-15',
            genre_ids: [878],
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const results = await searchMovies('  dune  ', {
      apiKey: TEST_API_KEY,
      limit: 3,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.themoviedb.org/3/search/movie?api_key=test-tmdb-api-key&query=dune&language=en-US&page=1'
    );
    expect(results).toEqual([
      {
        id: '438631',
        title: 'Dune',
        releaseYear: 2021,
        genre: 'Science Fiction',
      },
    ]);
  });

  it('skips invalid documents and allows missing optional fields', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [
            null,
            { title: 'Missing id' },
            { id: 100, title: 'Minimal Movie' },
          ],
        }),
      })
    );

    await expect(
      searchMovies('movies', { apiKey: TEST_API_KEY })
    ).resolves.toEqual([{ id: '100', title: 'Minimal Movie' }]);
  });

  it('limits the mapped result list', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [
            { id: 1, title: 'One' },
            { id: 2, title: 'Two' },
          ],
        }),
      })
    );

    await expect(
      searchMovies('movies', { apiKey: TEST_API_KEY, limit: 1 })
    ).resolves.toEqual([{ id: '1', title: 'One' }]);
  });

  it.each([
    ['empty query', ' ', TEST_API_KEY, undefined],
    ['missing key', 'dune', '', undefined],
    ['zero limit', 'dune', TEST_API_KEY, 0],
  ])('rejects an invalid %s', async (_caseName, query, apiKey, limit) => {
    const options = limit === undefined ? { apiKey } : { apiKey, limit };
    await expect(searchMovies(query, options)).rejects.toBeInstanceOf(TmdbError);
  });

  it('wraps network failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await expect(
      searchMovies('dune', { apiKey: TEST_API_KEY })
    ).rejects.toMatchObject({
      name: 'TmdbError',
      message: 'Network request to TMDB failed',
    });
  });

  it('reports unsuccessful HTTP responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 401 })
    );

    await expect(
      searchMovies('dune', { apiKey: TEST_API_KEY })
    ).rejects.toThrow('TMDB returned HTTP 401');
  });

  it('reports invalid JSON or payload shapes', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new SyntaxError('invalid JSON');
        },
      })
    );
    await expect(
      searchMovies('dune', { apiKey: TEST_API_KEY })
    ).rejects.toThrow('Failed to parse TMDB response as JSON');

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: 'not-an-array' }),
      })
    );
    await expect(
      searchMovies('dune', { apiKey: TEST_API_KEY })
    ).rejects.toThrow('TMDB returned an invalid response');
  });
});
