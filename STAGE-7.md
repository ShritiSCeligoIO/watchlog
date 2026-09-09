# Stage 7 — Internationalization and measured performance

Stage 7 keeps the complete Stage 6 state and query behavior.
It changes how text is supplied, how item UI is reused, and where measured
render work can be skipped.

## 1. What stayed the same

State keeps three owners: Zustand for local UI, TanStack Query for server data, and URL parameters for shareable filters. Search remains debounced and
cancellable. Optimistic writes, rollback, query keys, stale times, and retries
are unchanged. Internationalization changes presentation, not data behavior.

## 2. The translation libraries

The app uses:

- `i18next` for translation resources and language changes
- `react-i18next` for React hooks and `<Trans>`
- `i18next-browser-languagedetector` for saved and browser preferences
- `i18next-resources-to-backend` for lazy JSON imports

Every dependency is pinned to an exact version in `package.json`.

## 3. Namespaces

Translations are divided into four namespaces:

- `common` contains navigation, actions, themes, and shared labels.
- `watchlist` contains list, filter, detail, edit, and dialog text.
- `search` contains search controls, hints, and errors.
- `auth` contains the sign-in page.

Namespaces keep one giant JSON file from becoming difficult to scan.
```tsx
const { t } = useTranslation(['watchlist', 'common']);
```

```tsx
t('watchlist:filters.heading');
t('common:actions.remove');
```

## 4. Bundled English and lazy Spanish

English is imported normally in `src/i18n/index.ts`.
It is available before the first React render and is also the fallback.

Spanish uses a small lazy map:

```ts
const lazyNamespaces = {
  'es/common': () => import('./locales/es/common.json'),
  'es/watchlist': () => import('./locales/es/watchlist.json'),
  'es/search': () => import('./locales/es/search.json'),
  'es/auth': () => import('./locales/es/auth.json'),
};
```

Those imports become separate production chunks.
A visitor who only uses English does not download the Spanish files.

`partialBundledLanguages: true` tells i18next that some languages are bundled
and others must use the lazy backend.

## 5. Detecting and remembering language

Detection checks:

1. `localStorage`
2. the browser language

The saved key is `watchlog:language`.
A stored choice wins on the next page load.

`load: 'languageOnly'` turns a browser value such as `es-MX` into `es`.
Unsupported values fall back to English.

Each successful language change also updates `<html lang>`.
Screen readers use that attribute to choose pronunciation rules.

## 6. Starting before React

`bootstrap.tsx` waits for `initI18n()` before rendering.
That prevents a first frame containing raw keys such as `nav.watchlist`.

The initialization promise is cached.
Calling `initI18n()` twice returns the same work instead of starting twice.

`Suspense` remains around the app for namespace loading.
The language switch normally keeps the current screen visible through a React
transition, so users do not see a blank loading frame.

## 7. The language switcher

`LanguageSwitcher` uses `useTransition`.
Changing to Spanish is asynchronous because four locale chunks may load.

While that happens:

- the existing language remains readable
- the selector is disabled
- an `aria-live` status announces the change
- a failed load shows an accessible error

The options say `English` and `Español` in their own languages.
Someone who selected the wrong language can still recognize the right option.

## 8. Typed translation keys

`src/i18n/i18next.d.ts` augments i18next.
The English JSON files become the key contract.

This typo fails TypeScript:

```ts
t('actions.remvoe');
```

Interpolation is checked too.
A string containing `{{title}}` requires a `title` value.

## 9. Complete locales

Typed keys stop components from asking for missing English keys.
They do not prove that Spanish contains every key.
`localeCompleteness.ts` compares the leaf paths of Spanish and English.
Missing or unexpected paths fail this command:
```bash
npm run typecheck:locales
```
The file is type-only and adds no production JavaScript.
For languages with more plural forms, the comparison would need to allow their
extra plural suffixes.

## 10. Values are not display labels

The data model stores values such as `want`, `watching`, and `done`.
Printing those values directly would leak English-shaped database values.

`labelKeys.ts` maps each enum value to a typed translation key.
The map uses `satisfies Record<...>` so a new status cannot be forgotten.

The same status keys are used by badges, filters, and the edit form.
One concept therefore has one translated label.

## 11. Translation features in use

Interpolation inserts values:

```tsx
t('removeDialog.description', { title: itemTitle });
```

Pluralization uses the special `count` value:

```tsx
t('page.heading', { count: filteredItems.length });
```

i18next chooses `_one` or `_other`.
The component does not build the sentence from fragments.

`<Trans>` handles sentences containing styled markup.
The movie configuration hint and missing-item message contain `<code>`.
Translators can move that element without moving CSS into JSON.

## 12. Locale-aware values

Translated words are only half of localization.
Dates and numbers also follow locale rules.

`src/i18n/format.ts` wraps the browser `Intl` APIs:
- `Intl.NumberFormat` formats decimals.
- percent style formats completion rates.
- `Intl.DateTimeFormat` formats added dates.
English displays `4.5`; Spanish displays `4,5`.
The date helper preserves invalid source text instead of showing `Invalid Date`.

## 13. The compound ItemCard

List and detail pages used to duplicate item labels and metadata.
`ItemCard` now shares one item through React Context.

Its complete API has six parts:
- `ItemCard.Root`
- `ItemCard.Title`
- `ItemCard.Badges`
- `ItemCard.Rating`
- `ItemCard.Details`
- `ItemCard.Actions`

The title has one render prop:
```tsx
<ItemCard.Title>
  {(title) => <Link to={path}>{title}</Link>}
</ItemCard.Title>
```

The list turns the title into a link.
The detail page uses the default plain title.
Both pages reuse the same translated badges and details.

Context removes repeated `item={item}` props from every part.
Using a part outside `ItemCard.Root` throws a clear wiring error.

## 14. Performance work

The performance audit measured before and after the optimizations.
It did not begin by adding memoization everywhere.
The retained tools are:
- `React.memo` for cards, search rows, stats, and the search panel
- `useMemo` for filtered items, statistics, and the watchlist ID set
- `useCallback` only for the callback passed to memoized search rows
- `useDeferredValue` for rendering a replaced search result list

Opening and cancelling the removal dialog fell from 36 renders to 4.
Typing four characters over ten results fell from 116 renders to 36.

See `docs/performance-audit.md` for setup, component counts, and caveats.

## 15. What was deliberately not optimized

`WatchlistPage` still renders when its pending dialog state changes.
Splitting a tiny owner component only to avoid that work would add complexity.
The `Intl` formatter objects are not cached.
Three calls inside an already memoized stats panel are not a hot loop.
Small leaf controls are not wrapped in `memo`.
A prop comparison has a cost and is wasted when a component usually changes.

## 16. Verification

Run:
```bash
npm install
npm test
npm run typecheck
npm run typecheck:locales
npm run build:lib
npm run build:app
```
Then smoke-test both languages:
1. Open `/watchlist` in English.
2. Select `Español`.
3. Confirm Spanish labels and `<html lang="es">`.
4. Reload.
5. Confirm Spanish remains selected.

Stage 7 is complete when localization changes presentation without changing
the Stage 6 ownership, caching, optimistic updates, or URL behavior.
