import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchMovies, TmdbError } from './tmdbClient.js';

const TEST_API_KEY = 'test-tmdb-api-key';

describe('searchMovies', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requests the TMDB v3 search/movie endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await searchMovies('dune', { apiKey: TEST_API_KEY });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('https://api.themoviedb.org/3/search/movie')
    );
  });

  it('maps TMDB results into normalized movie search results', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [
            {
              id: 438631,
              title: 'Dune',
              release_date: '2021-09-15',
              genre_ids: [878, 12],
            },
          ],
        }),
      })
    );

    const results = await searchMovies('dune', { apiKey: TEST_API_KEY });

    expect(results).toEqual([
      {
        id: '438631',
        title: 'Dune',
        releaseYear: 2021,
        genre: 'Science Fiction',
      },
    ]);
  });

  it('maps docs with only required fields', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [{ id: 100, title: 'Minimal Movie' }],
        }),
      })
    );

    const results = await searchMovies('minimal', { apiKey: TEST_API_KEY });

    expect(results).toEqual([{ id: '100', title: 'Minimal Movie' }]);
  });

  it('omits genre when TMDB genre id is unknown', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [
            {
              id: 200,
              title: 'Unknown Genre Movie',
              genre_ids: [99999],
            },
          ],
        }),
      })
    );

    const results = await searchMovies('unknown', { apiKey: TEST_API_KEY });

    expect(results).toEqual([{ id: '200', title: 'Unknown Genre Movie' }]);
  });

  it('omits releaseYear when release_date is missing or invalid', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [
            { id: 301, title: 'No Date Movie' },
            { id: 302, title: 'Bad Date Movie', release_date: 'TBD' },
          ],
        }),
      })
    );

    const results = await searchMovies('dates', { apiKey: TEST_API_KEY });

    expect(results).toEqual([
      { id: '301', title: 'No Date Movie' },
      { id: '302', title: 'Bad Date Movie' },
    ]);
  });

  it('trims whitespace from the query before searching', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await searchMovies('  dune  ', { apiKey: TEST_API_KEY });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('query=dune')
    );
  });

  it('returns an empty array when results is empty', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      })
    );

    await expect(searchMovies('nothing-here', { apiKey: TEST_API_KEY })).resolves.toEqual(
      []
    );
  });

  it('returns an empty array when results is missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })
    );

    await expect(searchMovies('missing-results', { apiKey: TEST_API_KEY })).resolves.toEqual(
      []
    );
  });

  it('skips results missing id or title', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [
            { title: 'No Id' },
            { id: 401 },
            { id: 402, title: 'Valid Movie' },
          ],
        }),
      })
    );

    const results = await searchMovies('movies', { apiKey: TEST_API_KEY });

    expect(results).toEqual([{ id: '402', title: 'Valid Movie' }]);
  });

  it('applies the limit after mapping results', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [
            { id: 1, title: 'Movie One' },
            { id: 2, title: 'Movie Two' },
            { id: 3, title: 'Movie Three' },
          ],
        }),
      })
    );

    const results = await searchMovies('movies', { apiKey: TEST_API_KEY, limit: 2 });

    expect(results).toEqual([
      { id: '1', title: 'Movie One' },
      { id: '2', title: 'Movie Two' },
    ]);
  });

  it('throws when query is empty', async () => {
    await expect(searchMovies('', { apiKey: TEST_API_KEY })).rejects.toBeInstanceOf(
      TmdbError
    );
    await expect(searchMovies('   ', { apiKey: TEST_API_KEY })).rejects.toBeInstanceOf(
      TmdbError
    );
  });

  it('throws when TMDB API key is not configured', async () => {
    await expect(searchMovies('dune', { apiKey: '' })).rejects.toThrow(
      'TMDB API key is not configured'
    );
  });

  it('throws when the network request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await expect(searchMovies('dune', { apiKey: TEST_API_KEY })).rejects.toMatchObject({
      name: 'TmdbError',
      message: 'Network request to TMDB failed',
    });
  });

  it('throws when TMDB returns a non-2xx status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      })
    );

    await expect(searchMovies('dune', { apiKey: TEST_API_KEY })).rejects.toThrow(
      'TMDB returned HTTP 401 for search query'
    );
  });

  it('throws when the response body is not valid JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new SyntaxError('Unexpected token');
        },
      })
    );

    await expect(searchMovies('dune', { apiKey: TEST_API_KEY })).rejects.toMatchObject({
      name: 'TmdbError',
      message: 'Failed to parse TMDB response as JSON',
    });
  });
});
