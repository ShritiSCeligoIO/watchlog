import { afterEach, describe, expect, it, vi } from 'vitest';
import { OpenLibraryError, searchBooks } from './openLibraryClient.js';

describe('searchBooks', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
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

  it('throws when query is empty', async () => {
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
});
