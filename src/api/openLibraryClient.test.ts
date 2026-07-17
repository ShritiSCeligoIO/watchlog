import { afterEach, describe, expect, it, vi } from 'vitest';
import { OpenLibraryError, searchBooks } from './openLibraryClient.js';

describe('searchBooks', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requests the Open Library search.json endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ docs: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await searchBooks('dune');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/^https:\/\/openlibrary\.org\/search\.json\?/)
    );
  });

  it('maps Open Library docs into normalized book search results', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          docs: [
            {
              key: '/works/OL82586W',
              title: 'The Hobbit',
              author_name: ['J.R.R. Tolkien'],
              first_publish_year: 1937,
              subject: ['Fantasy'],
            },
          ],
        }),
      })
    );

    const results = await searchBooks('hobbit');

    expect(results).toEqual([
      {
        id: 'works/OL82586W',
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        publishYear: 1937,
        genre: 'Fantasy',
      },
    ]);
  });

  it('maps docs with only required fields and strips the leading slash from key', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          docs: [{ key: '/works/OL123W', title: 'Minimal Book' }],
        }),
      })
    );

    const results = await searchBooks('minimal');

    expect(results).toEqual([{ id: 'works/OL123W', title: 'Minimal Book' }]);
  });

  it('trims whitespace from the query before searching', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ docs: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await searchBooks('  dune  ');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('q=dune')
    );
  });

  it('returns an empty array when docs is empty', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ docs: [] }),
      })
    );

    await expect(searchBooks('nothing-here')).resolves.toEqual([]);
  });

  it('returns an empty array when docs is missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })
    );

    await expect(searchBooks('missing-docs')).resolves.toEqual([]);
  });

  it('skips docs missing key or title', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          docs: [
            { title: 'No Key' },
            { key: '/works/OL999W' },
            { key: '/works/OL100W', title: 'Valid Book' },
          ],
        }),
      })
    );

    const results = await searchBooks('books');

    expect(results).toEqual([{ id: 'works/OL100W', title: 'Valid Book' }]);
  });

  it('uses the provided limit in the search URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ docs: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await searchBooks('dune', { limit: 3 });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('limit=3')
    );
  });

  it('throws when query is empty', async () => {
    await expect(searchBooks('')).rejects.toBeInstanceOf(OpenLibraryError);
    await expect(searchBooks('   ')).rejects.toBeInstanceOf(OpenLibraryError);
  });

  it('throws when the network request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await expect(searchBooks('dune')).rejects.toMatchObject({
      name: 'OpenLibraryError',
      message: 'Network request to Open Library failed',
    });
  });

  it('throws when Open Library returns a non-2xx status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      })
    );

    await expect(searchBooks('dune')).rejects.toThrow(
      'Open Library returned HTTP 503 for search query'
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

    await expect(searchBooks('dune')).rejects.toMatchObject({
      name: 'OpenLibraryError',
      message: 'Failed to parse Open Library response as JSON',
    });
  });
});
