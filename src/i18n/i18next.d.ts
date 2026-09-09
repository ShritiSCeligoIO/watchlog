/**
 * Turns the English files into the app's translation contract.
 *
 * i18next's own types accept any string as a key, so a typo or a deleted entry
 * only shows up as a raw key on screen. Handing it the shape of the English
 * resources swaps that runtime surprise for a compile error: `t()` now accepts
 * only keys that exist, and only with the interpolation values the string
 * actually uses.
 *
 * `typeof import(...)` is a type-only reference, so nothing here is bundled.
 */

/**
 * Not decorative. A `.d.ts` with no top-level import or export is treated as a
 * global script, and `declare module 'i18next'` inside a global script *defines*
 * a module called `i18next` rather than extending the real one — shadowing the
 * package with an empty stub, so that `i18next.t` and even `<Trans>` stop
 * existing. This import makes the file a module, which is what turns the block
 * below into an augmentation.
 */
import 'i18next';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof import('./locales/en/common.json');
      watchlist: typeof import('./locales/en/watchlist.json');
      search: typeof import('./locales/en/search.json');
      auth: typeof import('./locales/en/auth.json');
    };
  }
}
