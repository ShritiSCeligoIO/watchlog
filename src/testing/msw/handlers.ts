import { http, HttpResponse } from 'msw';
import {
  openLibraryDunePayload,
  openLibraryHobbitPayload,
  tmdbDunePayload,
} from './payloads.js';

export const OPEN_LIBRARY_SEARCH_URL = 'https://openlibrary.org/search.json';
export const TMDB_SEARCH_URL = 'https://api.themoviedb.org/3/search/movie';

export const handlers = [
  http.get(OPEN_LIBRARY_SEARCH_URL, ({ request }) => {
    const query = new URL(request.url).searchParams.get('q')?.toLowerCase();
    if (!query) {
      return HttpResponse.json({ error: 'q is required' }, { status: 400 });
    }
    if (query === 'dune') {
      return HttpResponse.json(openLibraryDunePayload);
    }
    if (query === 'hobbit') {
      return HttpResponse.json(openLibraryHobbitPayload);
    }
    return HttpResponse.json({ docs: [] });
  }),
  http.get(TMDB_SEARCH_URL, ({ request }) => {
    const url = new URL(request.url);
    if (!url.searchParams.get('api_key')) {
      return HttpResponse.json({ status_message: 'Invalid API key' }, { status: 401 });
    }
    return HttpResponse.json(
      url.searchParams.get('query')?.toLowerCase() === 'dune'
        ? tmdbDunePayload
        : { page: 1, total_results: 0, results: [] }
    );
  }),
];

export function openLibraryFailure(status = 500) {
  return http.get(OPEN_LIBRARY_SEARCH_URL, () =>
    HttpResponse.json({ error: 'Search failed' }, { status })
  );
}

export function delayedHobbit(delayMs = 80) {
  return http.get(OPEN_LIBRARY_SEARCH_URL, async () => {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return HttpResponse.json(openLibraryHobbitPayload);
  });
}
