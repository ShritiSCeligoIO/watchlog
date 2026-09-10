import type { WatchStatus, WatchlistItem } from '../types/watchlistItem.js';

/** `'movie' | 'book'`, taken from the item union so the two cannot drift apart. */
type MediaType = WatchlistItem['type'];

/**
 * Maps the data model's values onto translation keys.
 *
 * Until now `item.status` was printed straight to the screen, so the badge read
 * "want" — lower case, English, and a database value leaking into the UI. The
 * fix is a lookup rather than a template like `t('status.' + status)`, because
 * a record keyed by the union gives two guarantees a template cannot: adding a
 * fourth status fails to compile until this map is extended, and the resulting
 * key is a literal type that `t()` can still check against the resources.
 */
export const STATUS_LABEL_KEYS = {
  want: 'status.want',
  watching: 'status.watching',
  done: 'status.done',
} as const satisfies Record<WatchStatus, string>;

/** Singular, for the badge on a single item. */
export const MEDIA_TYPE_LABEL_KEYS = {
  movie: 'mediaType.movie',
  book: 'mediaType.book',
} as const satisfies Record<MediaType, string>;

/** Plural, for the tabs and filters that name a whole group. */
export const MEDIA_TYPE_PLURAL_KEYS = {
  movie: 'mediaType.movies',
  book: 'mediaType.books',
} as const satisfies Record<MediaType, string>;
