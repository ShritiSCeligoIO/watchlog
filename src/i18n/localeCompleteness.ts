/**
 * This compile-time check makes Spanish contain exactly the English keys.
 * It creates no runtime JavaScript.
 */

/**
 * Flattens a resource object into its dotted leaf paths, so
 * `{ nav: { signIn: string } }` becomes `'nav.signIn'`.
 */
type TranslationPaths<T> = {
  [K in keyof T & string]: T[K] extends string
    ? K
    : `${K}.${TranslationPaths<T[K]>}`;
}[keyof T & string];

/**
 * Resolves to `true` when the candidate locale matches the reference exactly,
 * and otherwise to an object naming the offending paths — which then shows up
 * in the compiler error.
 */
type Complete<Reference, Candidate> = [
  Exclude<TranslationPaths<Reference>, TranslationPaths<Candidate>>,
] extends [never]
  ? [Exclude<TranslationPaths<Candidate>, TranslationPaths<Reference>>] extends [
      never,
    ]
    ? true
    : {
        unexpectedKeys: Exclude<
          TranslationPaths<Candidate>,
          TranslationPaths<Reference>
        >;
      }
  : {
      missingKeys: Exclude<
        TranslationPaths<Reference>,
        TranslationPaths<Candidate>
      >;
    };

/** The constraint is what turns an incomplete locale into a build failure. */
type AssertComplete<T extends true> = T;

export type EsCommonIsComplete = AssertComplete<
  Complete<
    typeof import('./locales/en/common.json'),
    typeof import('./locales/es/common.json')
  >
>;

export type EsWatchlistIsComplete = AssertComplete<
  Complete<
    typeof import('./locales/en/watchlist.json'),
    typeof import('./locales/es/watchlist.json')
  >
>;

export type EsSearchIsComplete = AssertComplete<
  Complete<
    typeof import('./locales/en/search.json'),
    typeof import('./locales/es/search.json')
  >
>;

export type EsAuthIsComplete = AssertComplete<
  Complete<
    typeof import('./locales/en/auth.json'),
    typeof import('./locales/es/auth.json')
  >
>;
