/**
 * Namespaces split the strings by the part of the app that uses them, so a
 * locale is a handful of small files instead of one growing blob. They are also
 * the unit of lazy loading: switching language fetches only these four files
 * for the new locale.
 */
export const NAMESPACES = ['common', 'watchlist', 'search', 'auth'] as const;

export type Namespace = (typeof NAMESPACES)[number];

/** `t('appName')` with no prefix resolves here. */
export const DEFAULT_NAMESPACE: Namespace = 'common';
