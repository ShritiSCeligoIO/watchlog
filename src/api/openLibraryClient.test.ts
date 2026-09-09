import { afterEach, describe, expect, it, vi } from 'vitest';
import { OpenLibraryError, searchBooks } from './openLibraryClient.js';

describe('searchBooks', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requests Open Library and maps valid results', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
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
    });
    vi.stubGlobal('fetch', fetchMock);

    const results = await searchBooks('  hobbit  ', { limit: 3 });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://openlibrary.org/search.json?q=hobbit&limit=3'
    );
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

  it('skips invalid documents and allows missing optional fields', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          docs: [
            null,
            { title: 'Missing key' },
            { key: '/works/OL123W', title: 'Minimal Book' },
          ],
        }),
      })
    );

    await expect(searchBooks('books')).resolves.toEqual([
      { id: 'works/OL123W', title: 'Minimal Book' },
    ]);
  });

  it('returns an empty list when the response omits docs', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
    );

    await expect(searchBooks('books')).resolves.toEqual([]);
  });

  it.each([
    ['empty query', ' ', undefined],
    ['zero limit', 'books', 0],
    ['decimal limit', 'books', 1.5],
  ])('rejects an invalid %s', async (_caseName, query, limit) => {
    const options = limit === undefined ? {} : { limit };
    await expect(searchBooks(query, options)).rejects.toBeInstanceOf(OpenLibraryError);
  });

  it('wraps network failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await expect(searchBooks('dune')).rejects.toMatchObject({
      name: 'OpenLibraryError',
      message: 'Network request to Open Library failed',
    });
  });

  it('reports unsuccessful HTTP responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 503 })
    );

    await expect(searchBooks('dune')).rejects.toThrow(
      'Open Library returned HTTP 503'
    );
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
    await expect(searchBooks('dune')).rejects.toThrow(
      'Failed to parse Open Library response as JSON'
    );

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ docs: 'not-an-array' }),
      })
    );
    await expect(searchBooks('dune')).rejects.toThrow(
      'Open Library returned an invalid response'
    );
  });
});
