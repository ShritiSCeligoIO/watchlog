/** Minimum characters before calling search APIs (avoids Open Library 422 on "d"). */
export const MIN_SEARCH_QUERY_LENGTH = 3;

/** Wait briefly so typing a word does not send one request per key. */
export const SEARCH_DEBOUNCE_MS = 350;
