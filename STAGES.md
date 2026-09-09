# WatchLog learning path

WatchLog grows one idea at a time across nine Git branches.

`main` intentionally contains the **Stage 6 application**, because that is the
latest stage studied so far. It also contains all nine short stage guides so the
whole learning path can be read without switching branches.

## How to use the branches

Read any guide on `main`:

```text
STAGE-1.md
STAGE-2.md
...
STAGE-9.md
```

Run a stage by checking out its branch:

```bash
git switch stage-4
npm install
npm run dev
```

Run `npm install` after every branch switch. Later stages use different build
and test tools, so an old `node_modules` directory may not match the branch.

## Stage 1 — TypeScript foundations

**Branch:** `stage-1`

Builds the data and rule layer before React exists:

- movie and book types,
- discriminated unions and type guards,
- pure filter, sort, group, and statistics functions,
- Open Library and TMDB clients,
- central environment configuration, and
- focused Vitest tests.

Start with [STAGE-1.md](./STAGE-1.md).

## Stage 2 — React and Context

**Branch:** `stage-2`

Turns the TypeScript library into a screen:

- React components and controlled inputs,
- Context for the watchlist and selected item,
- a custom search hook,
- debouncing and request cancellation, and
- loading, error, and empty states.

Continue with [STAGE-2.md](./STAGE-2.md).

## Stage 3 — React Router

**Branch:** `stage-3`

Makes the URL the source of navigation:

- list, detail, edit, and login routes,
- nested layouts,
- URL-backed filters,
- protected routes, and
- selection through `:itemId` instead of Context.

Continue with [STAGE-3.md](./STAGE-3.md).

## Stage 4 — Tailwind and Radix

**Branch:** `stage-4`

Redesigns the same behavior without changing the data architecture:

- Tailwind utility classes,
- readable light and dark design tokens,
- accessible Radix controls,
- persisted dark mode, and
- a keyboard-friendly removal dialog.

Continue with [STAGE-4.md](./STAGE-4.md).

## Stage 5 — Redux Toolkit and redux-saga

**Branch:** `stage-5`

Moves shared state into Redux and async work into sagas:

- slices, actions, reducers, and the store,
- `takeLatest` search cancellation,
- selective retry with backoff,
- Reselect-derived data, and
- focused saga tests.

Continue with [STAGE-5.md](./STAGE-5.md).

## Stage 6 — Zustand and TanStack Query

**Branch:** `stage-6`

Separates three kinds of state:

- Zustand owns local UI choices,
- TanStack Query owns server data and its cache, and
- the URL owns shareable filters.

It also demonstrates optimistic updates, rollback, invalidation, and a mock
asynchronous backend.

Continue with [STAGE-6.md](./STAGE-6.md).

## Stage 7 — i18n and React patterns

**Branch:** `stage-7`

Adds:

- typed English and Spanish translations,
- lazy locale loading and plural rules,
- locale-aware number and date formatting,
- a six-part compound ItemCard, and
- measured render improvements with targeted memoization.

Continue with [STAGE-7.md](./STAGE-7.md).

## Stage 8 — Webpack and Module Federation

**Branch:** `stage-8`

Replaces the app build and makes WatchLog independently loadable:

- Webpack development and production builds,
- WatchLog as a remote,
- a separate host application,
- shared React and router singletons,
- lazy loading and remote failure handling, and
- bundle analysis plus a production gateway.

Continue with [STAGE-8.md](./STAGE-8.md).

## Stage 9 — Jest, Testing Library, and MSW

**Branch:** `stage-9`

Builds a focused testing safety net:

- Jest 29 and jsdom,
- React Testing Library and `user-event`,
- MSW network handlers,
- hook and page integration tests,
- one complete search-to-rating journey, and
- an enforced 80% coverage gate.

Continue with [STAGE-9.md](./STAGE-9.md).

## Comparing stages

Git can show exactly what one stage introduced:

```bash
git diff stage-5..stage-6
git diff --stat stage-7..stage-8
```

The rewritten branches form one cumulative chain, so these comparisons contain
only the lesson introduced by the later stage.
