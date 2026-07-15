/** Central config — all env reads live here (Stage 1: safe defaults only). */
const openLibraryBaseUrl =
  process.env.OPEN_LIBRARY_BASE_URL ?? 'https://openlibrary.org';

export const config = {
  openLibraryBaseUrl,
  openLibrarySearchPath: '/search.json',
} as const;
