# WatchLog — Reviewer Guide (Stages 1–4)

**Personal Movie & Book Watchlist — file-by-file reference for code review**

Repository: https://github.com/ShritiSCeligoIO/watchlog  
Reference branch: `main`  
Last updated: August 2026  
Scope: **Everything implemented through Stage 4** (not Stage 5+)

---

## One-page cheat sheet (print this)

### Elevator pitch (30 seconds)

> WatchLog is a movie/book watchlist in four layers: **Stage 1** typed library (types, utils, API clients), **Stage 2** React UI (components, search hook, context), **Stage 3** React Router (pages, URL filters, protected edit), **Stage 4** design system (Tailwind tokens, Radix primitives, CVA variants, dark mode). Data is in-memory from seed — no persistence yet. **100 unit tests** on library and pure UI logic; CI runs test + build + type-check.

### Routes (memorize)

| URL | Page | Auth? |
|-----|------|-------|
| `/watchlist` | List + search + filters | No |
| `/watchlist?type=movie&status=want` | Filtered list (survives refresh) | No |
| `/items/movie-1` | Item detail | No |
| `/items/movie-1/edit` | Edit form | **Yes** |
| `/login` | Mock sign-in | No |

### Startup chain (memorize)

`index.html` → `index.tsx` → `bootstrap.tsx` (Router + ErrorBoundary) → `App.tsx` (providers + routes) → `AppLayout` (Outlet) → Page

### Files you must know cold

| File | One line |
|------|----------|
| `types/watchlistItem.ts` | Domain model — movie/book union, status, optional rating |
| `config.ts` | All env vars in one place |
| `api/openLibraryClient.ts` | Async book search, no API key |
| `hooks/useMediaSearch.ts` | Search + AbortController cancel |
| `context/WatchlistDataContext.tsx` | Shared list CRUD across pages |
| `context/AuthContext.tsx` | Mock auth in sessionStorage |
| `hooks/useWatchlistFilters.ts` | Filters synced to URL query params |
| `App.tsx` | Route table + providers |
| `components/ProtectedRoute.tsx` | Redirect to login if not authed |
| `utils/searchMappers.ts` | API result → WatchlistItem |
| `lib/utils.ts` | `cn()` — safe Tailwind class merging |
| `lib/theme.ts` | Light/dark resolution, apply, persist |
| `components/ui/` | Radix primitives wrapped with project styling |

### 5-minute demo (checklist)

1. `/watchlist` — show list + search  
2. Search "dune" → Add book  
3. Filter URL changes (`?type=…&status=…`) → refresh → filters stay  
4. Click title → `/items/:id` deep link  
5. Edit → redirected to `/login` → sign in → edit → save  
6. Remove an item → Radix confirm dialog (Escape closes, focus returns)  
7. Toggle dark mode → refresh → theme persists  
8. (Optional) `npm test` → 100 passed  

### Top 10 reviewer questions → one-line answers

| Question | Answer |
|----------|--------|
| Where does watchlist data live? | `WatchlistDataContext` — React state seeded from `seedWatchlist.ts` |
| Why refresh loses changes? | No persistence yet — Stage 5 |
| Is auth real? | No — `sessionStorage` flag for ProtectedRoute demo |
| Why AbortController? | Cancel stale search when user types fast |
| Why two tsconfigs? | Library (`dist/`) vs React app (JSX/DOM) |
| Why bootstrap vs index? | Tiny entry file — integrator-ui pattern |
| Where are env vars read? | Only `config.ts` |
| Why no component tests? | Stages 2–4 focus on patterns; pure logic has 100 unit tests |
| How do URL filters work? | `useWatchlistFilters` reads/writes `useSearchParams` |
| What does ErrorBoundary catch? | Render errors only — not clicks or fetch |
| Why Radix instead of hand-rolled? | Free accessibility: focus trap, keyboard nav, ARIA wiring |
| Why `cn()` and not plain strings? | `tailwind-merge` resolves conflicting utilities so overrides win |
| Why CVA? | One declarative place for card status variants instead of ternary soup |

### Honest limitations (say these proactively)

- No localStorage / backend persistence  
- Mock auth, not production security  
- `sortByRating`, `groupByGenre`, `statsSummary` built in Stage 1 but not wired to UI yet  
- Movie search needs `TMDB_API_KEY` in `.env`  

---

## How to use this document

You are preparing to **walk a reviewer through your code**. This guide is organized for that job:

1. **Part A** — What to demo live (5 minutes)
2. **Part B** — Architecture at a glance
3. **Part C** — **Every file explained** (the main reference)
4. **Part D** — Stage 1 / 2 / 3 / 4 concepts in plain English
5. **Part E** — End-to-end data flows (trace one user action)
6. **Part F** — Likely reviewer questions and honest answers
7. **Part G** — Tests, CI, commands

Technical terms are explained when they first appear. Stages 5–9 are listed only as *future work* — they are not in the submitted code.

---

# Part A — 5-minute reviewer demo script

Say this out loud while clicking through the app (`npm run dev`).

| Step | Action | What to say |
|------|--------|-------------|
| 1 | Open `/watchlist` | "This is the main page — search, filters, and the list share one URL namespace." |
| 2 | Search "dune", add a book | "Search uses a custom hook with AbortController so fast typing cancels stale requests. Add goes through a mapper into shared context state." |
| 3 | Set filters: Type = movie, Status = want | "Filters live in the URL query string (`?type=movie&status=want`) so refresh keeps them — implemented in `useWatchlistFilters`." |
| 4 | Click **Arrival** title | "Each item is deep-linkable at `/items/movie-1`. Card passes filter state so Back restores filters." |
| 5 | Click **Edit** on detail page | "Edit is protected — I'll get redirected to login." |
| 6 | Sign in at `/login` | "Mock auth via sessionStorage — enough to demonstrate ProtectedRoute, not production security." |
| 7 | Edit status to Done, set rating, save | "Update logic in WatchlistDataContext enforces rating only on done items." |
| 9 | Click **Remove** on a card | "Removal goes through a Radix Dialog — focus is trapped, Escape cancels, and focus returns to the trigger. I get that behaviour from the primitive instead of writing it myself." |
| 10 | Toggle dark mode, then refresh | "Theme is a class on `<html>` driven by CSS variables. The choice is persisted, and `bootstrap.tsx` applies it before the first paint so there's no flash of the wrong theme." |
| 11 | Run `npm test` (optional) | "100 unit tests — pure functions, API clients, and the Stage 4 helpers (`cn`, theme resolution, card variants). No React component tests; the assignment stages focus on patterns." |

**One sentence pitch:** "Stage 1 is a typed library; Stage 2 adds React UI and search; Stage 3 adds React Router with URL filters, deep links, and an auth guard on edit; Stage 4 replaces hand-written CSS with a Tailwind design-token system, Radix primitives for accessible behaviour, and CVA for component variants."

---

# Part B — Architecture at a glance

## Layer cake (what depends on what)

```text
┌─────────────────────────────────────────────────────────┐
│  PAGES (URLs)     WatchlistPage, ItemDetailPage, etc.   │
├─────────────────────────────────────────────────────────┤
│  COMPONENTS       SearchPanel, WatchlistItemCard, …     │
├─────────────────────────────────────────────────────────┤
│  UI PRIMITIVES    components/ui/ (Radix + Tailwind),    │
│                   cn(), CVA variants, design tokens     │
├─────────────────────────────────────────────────────────┤
│  HOOKS + CONTEXT  useMediaSearch, useWatchlistFilters,  │
│                   AuthContext, WatchlistDataContext     │
├─────────────────────────────────────────────────────────┤
│  STAGE 1 LIBRARY  types, utils, api clients, config     │
└─────────────────────────────────────────────────────────┘
```

## App startup chain

```text
index.html
  → index.tsx          (imports bootstrap only — tiny entry)
    → bootstrap.tsx    (BrowserRouter, ErrorBoundary, CSS, mount React)
      → App.tsx        (AuthProvider, WatchlistDataProvider, Routes)
        → AppLayout    (header, nav, <Outlet />)
          → current Page
```

## Route map

| URL | Page | Auth |
|-----|------|------|
| `/` | Redirect → `/watchlist` | Open |
| `/watchlist` | List + search + filters | Open |
| `/watchlist?type=movie&status=want` | Filtered list | Open |
| `/items/:itemId` | Item detail | Open |
| `/items/:itemId/edit` | Edit form | **Protected** |
| `/login` | Mock sign-in | Open |
| `*` (unknown) | Redirect → `/watchlist` | Open |

## Stage progress in this submission

| Stage | Topic | Status |
|-------|--------|--------|
| 1 | TypeScript utility module | ✅ Complete |
| 2 | React UI fundamentals | ✅ Complete |
| 3 | React Router v6 | ✅ Complete |
| 4 | Tailwind + Radix design system | ✅ Complete |
| 5–9 | Redux, persistence, i18n, MFE, etc. | 🔜 Not in this submission |

---

# Part C — Every file explained

Below is **every file** in the Stage 4 submission (branch `main`), grouped by folder.  
For each file: **purpose**, **stage**, **key exports**, and **what to tell the reviewer**.

---

## Root — project configuration

### `package.json`

| | |
|--|--|
| **Purpose** | Project metadata, npm scripts, pinned dependencies |
| **Stage** | 1+ |
| **Key scripts** | `dev`, `test`, `build` (library → `dist/`), `build:app` (React → `build/`) |
| **Tell reviewer** | "Node 22.11.0 matches integrator-ui. React 19 and react-router-dom 6.28.0 are pinned exact versions." |

### `package-lock.json`

| | |
|--|--|
| **Purpose** | Locked dependency tree for reproducible `npm ci` in CI |
| **Stage** | 1+ |
| **Tell reviewer** | "CI uses `npm ci`, not `npm install`." |

### `vite.config.ts`

| | |
|--|--|
| **Purpose** | Vite dev server, production app build, Vitest test runner |
| **Stage** | 2+ |
| **Notable settings** | `root: 'src'` (app lives under src/); `envDir` points to repo root for `.env`; `envPrefix: ['VITE_', 'TMDB_']` exposes TMDB key to browser |
| **Tell reviewer** | "Same root-under-src pattern as integrator-ui. Tests run in Node environment via vitest.setup." |

### `tsconfig.json`

| | |
|--|--|
| **Purpose** | Root TypeScript project references |
| **Stage** | 1+ |
| **Tell reviewer** | "Split configs: library build vs app type-check vs Node tooling." |

### `tsconfig.lib.json`

| | |
|--|--|
| **Purpose** | Compiles Stage 1 library from `src/` → `dist/` |
| **Stage** | 1 |
| **Tell reviewer** | "`npm run build` produces the publishable library artifact." |

### `tsconfig.app.json`

| | |
|--|--|
| **Purpose** | Type-checks React app code (JSX, DOM types) |
| **Stage** | 2+ |
| **Tell reviewer** | "CI runs `npx tsc -b` to type-check app and tooling together." |

### `tsconfig.node.json`

| | |
|--|--|
| **Purpose** | Type-checks Node-only files (`vite.config.ts`, `vitest.setup.ts`) |
| **Stage** | 1+ |

### `vitest.setup.ts`

| | |
|--|--|
| **Purpose** | Loads `.env` from repo root before tests run (dotenv) |
| **Stage** | 1+ |
| **Tell reviewer** | "Tests can read TMDB_API_KEY the same way Node scripts do." |

### `.env.example`

| | |
|--|--|
| **Purpose** | Documents environment variables; copy to `.env` for local dev |
| **Stage** | 1+ |
| **Variables** | `TMDB_API_KEY` (optional for books; required for movie search) |
| **Tell reviewer** | "Book search needs no key. Movie search degrades gracefully when key is missing." |

### `.gitignore`

| | |
|--|--|
| **Purpose** | Ignores `node_modules/`, `dist/`, `build/`, `.env`, and `docs/*.pdf` |
| **Stage** | 1+ |

### `.github/workflows/ci.yml`

| | |
|--|--|
| **Purpose** | GitHub Actions pipeline on push/PR to `main` |
| **Stage** | 1+ |
| **Steps** | checkout → Node 22.11.0 → `npm ci` → `npm test` → `npm run build` → `npm run build:app` → `npx tsc -b` |
| **Tell reviewer** | "Green CI means tests, library build, app build, and full type-check all pass." |

---

## `docs/` — documentation (not runtime code)

### `docs/WatchLog-Complete-Guide.md`

| | |
|--|--|
| **Purpose** | This reviewer guide (source for PDF) |
| **Stage** | Docs |

### `docs/pdf-style.css`

| | |
|--|--|
| **Purpose** | Stylesheet for PDF generation (`md-to-pdf`) |
| **Stage** | Docs |

### `docs/WatchLog-Complete-Guide.pdf`

| | |
|--|--|
| **Purpose** | PDF export of this guide (local only — gitignored) |
| **Regenerate** | `npx md-to-pdf docs/WatchLog-Complete-Guide.md --stylesheet docs/pdf-style.css` |

### `README.md`

| | |
|--|--|
| **Purpose** | Repo overview, setup, scripts, feature list by stage |
| **Stage** | All |
| **Tell reviewer** | "Start here for setup; this guide goes deeper file-by-file." |

---

## `src/` — application entry

### `src/index.html`

| | |
|--|--|
| **Purpose** | Minimal HTML shell with `<div id="root">` |
| **Stage** | 2 |
| **Tell reviewer** | "Vite uses this as the page template; React mounts into `#root`." |

### `src/index.tsx`

| | |
|--|--|
| **Purpose** | One-line entry — imports `./bootstrap` only |
| **Stage** | 2 |
| **Tell reviewer** | "Tiny entry file enables code-splitting pattern from integrator-ui." |

### `src/bootstrap.tsx`

| | |
|--|--|
| **Purpose** | App bootstrap: apply theme, load CSS, warn if TMDB missing, mount React tree |
| **Stage** | 2 (Router wrapper added in Stage 3, theme in Stage 4) |
| **Wraps** | `StrictMode` → `ErrorBoundary` → `BrowserRouter` → `App` |
| **Imports** | `./styles/globals.css`, `./lib/theme` |
| **Tell reviewer** | "BrowserRouter lives here so all routes share one router context. `applyTheme(resolveInitialTheme())` runs before React mounts so the page never flashes the wrong theme." |

### `src/App.tsx`

| | |
|--|--|
| **Purpose** | Route table + global providers |
| **Stage** | 3 |
| **Providers** | `AuthProvider`, `WatchlistDataProvider` |
| **Routes** | Nested under `AppLayout`: watchlist, item detail, edit (protected), login |
| **Special** | `EditItemRoute` uses `key={itemId}` so form state resets when navigating between items |
| **Tell reviewer** | "All route definitions in one place; protected edit uses a wrapper component." |

### `src/vite-env.d.ts`

| | |
|--|--|
| **Purpose** | TypeScript declarations for Vite (`import.meta.env`, etc.) |
| **Stage** | 2 |

---

## `src/types/` — Stage 1 data model

### `src/types/watchlistItem.ts`

| | |
|--|--|
| **Purpose** | Core domain types for movies and books |
| **Stage** | 1 |
| **Key types** | `WatchStatus`, `StarRating`, `MovieWatchlistItem`, `BookWatchlistItem`, `WatchlistItem` (union), `WatchlistItemUpdate`, `WatchlistStats` |
| **Type guards** | `isMovieItem`, `isBookItem`, `hasRating` |
| **Tell reviewer** | "Discriminated union — `item.type === 'movie'` narrows which fields exist. Update type uses `Partial` + `Omit`; `rating: null` explicitly clears a rating." |

### `src/types/watchlistItem.test.ts`

| | |
|--|--|
| **Purpose** | Tests type guards and edge cases on the data model |
| **Stage** | 1 |

---

## `src/config.ts` — central configuration

### `src/config.ts`

| | |
|--|--|
| **Purpose** | **Single place** for all environment variable reads |
| **Stage** | 1 |
| **Exports** | `config` object, `validateMovieSearchConfig`, `isMovieSearchConfigured`, `warnIfMovieSearchUnavailable` |
| **Tell reviewer** | "No scattered `process.env` — browser uses `import.meta.env`, tests use `process.env` via vitest.setup." |

### `src/config.test.ts`

| | |
|--|--|
| **Purpose** | Tests config helpers and env reading behavior |
| **Stage** | 1 |

---

## `src/constants/` — fixed values

### `src/constants/search.ts`

| | |
|--|--|
| **Purpose** | `MIN_SEARCH_QUERY_LENGTH` — minimum characters before search fires |
| **Stage** | 2 |
| **Tell reviewer** | "Prevents API spam on every keystroke." |

### `src/constants/watchlistFilters.ts`

| | |
|--|--|
| **Purpose** | URL param names, filter types, defaults, type guards for query params |
| **Stage** | 3 |
| **Exports** | `TYPE_FILTER_PARAM` (`type`), `STATUS_FILTER_PARAM` (`status`), `isTypeFilter`, `isStatusFilter` |
| **Tell reviewer** | "Invalid URL params fall back to `'all'` — safe parsing at the boundary." |

---

## `src/utils/` — Stage 1 pure functions

Pure functions: same input → same output, no side effects. Used by UI and tests.

### `src/utils/filterByStatus.ts`

| | |
|--|--|
| **Purpose** | Returns items matching a given `WatchStatus` |
| **Stage** | 1 |
| **Used by** | `filterWatchlistItems` (Stage 3) |

### `src/utils/filterByStatus.test.ts`

| | |
|--|--|
| **Purpose** | Unit tests for status filtering |
| **Stage** | 1 |

### `src/utils/sortByRating.ts`

| | |
|--|--|
| **Purpose** | Sort items by star rating (asc/desc); unrated items sort last |
| **Stage** | 1 |
| **Note** | Not wired to UI yet — library capability for later stages |

### `src/utils/sortByRating.test.ts`

| | |
|--|--|
| **Purpose** | Unit tests for rating sort |
| **Stage** | 1 |

### `src/utils/groupByGenre.ts`

| | |
|--|--|
| **Purpose** | Groups items into a `Record<string, WatchlistItem[]>` by genre |
| **Stage** | 1 |
| **Note** | Not wired to UI yet |

### `src/utils/groupByGenre.test.ts`

| | |
|--|--|
| **Purpose** | Unit tests for genre grouping |
| **Stage** | 1 |

### `src/utils/statsSummary.ts`

| | |
|--|--|
| **Purpose** | Computes `totalCount`, `completionRate`, `averageRating` |
| **Stage** | 1 |
| **Note** | Not wired to UI yet |

### `src/utils/statsSummary.test.ts`

| | |
|--|--|
| **Purpose** | Unit tests including empty list edge case |
| **Stage** | 1 |

### `src/utils/filterWatchlistItems.ts`

| | |
|--|--|
| **Purpose** | Combines type + status filters for the watchlist page |
| **Stage** | 3 |
| **Uses** | `filterByStatus` from Stage 1 |
| **Tell reviewer** | "UI filter logic delegates status filtering to the Stage 1 utility." |

### `src/utils/filterWatchlistItems.test.ts`

| | |
|--|--|
| **Purpose** | Tests combined type/status filtering |
| **Stage** | 3 |

### `src/utils/searchMappers.ts`

| | |
|--|--|
| **Purpose** | Converts API search hits → `WatchlistItem`; generates stable IDs |
| **Stage** | 2 |
| **Exports** | `bookSearchResultToWatchlistItem`, `movieSearchResultToWatchlistItem`, `watchlistIdForBookSearch`, `watchlistIdForMovieSearch` |
| **Tell reviewer** | "New items always start as status `want` with today's date. IDs are deterministic from API ids." |

### `src/utils/searchMappers.test.ts`

| | |
|--|--|
| **Purpose** | Tests mapper output shape and ID generation |
| **Stage** | 2 |

### `src/utils/index.ts`

| | |
|--|--|
| **Purpose** | Re-exports all Stage 1 utils for library consumers |
| **Stage** | 1 |

---

## `src/api/` — Stage 1 HTTP clients

### `src/api/openLibraryClient.ts`

| | |
|--|--|
| **Purpose** | Search books via Open Library public API |
| **Stage** | 1 |
| **Exports** | `searchBooks`, `BookSearchResult`, `OpenLibraryError` |
| **Features** | URL building, JSON parse, normalized results, optional `AbortSignal`, typed errors |
| **Tell reviewer** | "No API key needed for books. Errors throw `OpenLibraryError` with context." |

### `src/api/openLibraryClient.test.ts`

| | |
|--|--|
| **Purpose** | Tests search with mocked fetch |
| **Stage** | 1 |

### `src/api/tmdbClient.ts`

| | |
|--|--|
| **Purpose** | Search movies via TMDB API (bonus Stage 1 deliverable) |
| **Stage** | 1 |
| **Exports** | `searchMovies`, `MovieSearchResult`, `TmdbError` |
| **Tell reviewer** | "Requires TMDB_API_KEY. Skips gracefully in UI when not configured." |

### `src/api/tmdbClient.test.ts`

| | |
|--|--|
| **Purpose** | Tests TMDB client with mocked fetch |
| **Stage** | 1 |

### `src/api/index.ts`

| | |
|--|--|
| **Purpose** | Re-exports API clients for library consumers |
| **Stage** | 1 |

---

## `src/lib/` — library public surface

### `src/lib/index.ts`

| | |
|--|--|
| **Purpose** | Single entry point for Stage 1 npm library — re-exports types, utils, api, config |
| **Stage** | 1 |
| **Tell reviewer** | "External consumers import from `dist/` after `npm run build`." |

---

## `src/fixtures/` — sample data

### `src/fixtures/seedWatchlist.ts`

| | |
|--|--|
| **Purpose** | Initial watchlist when app loads (Arrival, Project Hail Mary, etc.) |
| **Stage** | 2 |
| **Exports** | `seedWatchlist`, `emptyWatchlist` |
| **Tell reviewer** | "In-memory only — refresh resets to this seed. Persistence is a future stage." |

### `src/fixtures/mockWatchlist.ts`

| | |
|--|--|
| **Purpose** | Re-exports seed data under test-friendly names (`mockWatchlist`) |
| **Stage** | 1+ |

---

## `src/hooks/` — custom React logic

### `src/hooks/useMediaSearch.ts`

| | |
|--|--|
| **Purpose** | Search books or movies when query/mediaType changes |
| **Stage** | 2 |
| **Returns** | `{ query, setQuery, results, loading, error }` |
| **Key behavior** | `AbortController` cancels in-flight request on re-type; min query length gate |
| **Tell reviewer** | "Custom hook extracts search side effects from SearchPanel — reusable and testable in isolation." |

### `src/hooks/useWatchlistFilters.ts`

| | |
|--|--|
| **Purpose** | Sync filter state with URL search params |
| **Stage** | 3 |
| **Returns** | `{ typeFilter, statusFilter, setTypeFilter, setStatusFilter, filterQuery }` |
| **Tell reviewer** | "Setting filter to default `'all'` removes the param — keeps URLs clean." |

---

## `src/context/` — shared app state

### `src/context/WatchlistDataContext.tsx`

| | |
|--|--|
| **Purpose** | Global watchlist CRUD — all pages share one items array |
| **Stage** | 2 (context), 3 (used across pages) |
| **API** | `items`, `addItem`, `removeItem`, `updateItem`, `getItemById` |
| **Rating rules** | Rating kept only when status is `done` and rating is valid; `rating: null` clears it |
| **Tell reviewer** | "Replaced Stage 2 single-page state. Duplicate adds are ignored by id." |

### `src/context/AuthContext.tsx`

| | |
|--|--|
| **Purpose** | Mock authentication for learning |
| **Stage** | 3 |
| **Storage** | `sessionStorage` key `watchlog_authenticated` |
| **API** | `isAuthenticated`, `login`, `logout` |
| **Tell reviewer** | "Not real auth — demonstrates ProtectedRoute pattern only." |

---

## `src/components/` — reusable UI

### `src/components/AppLayout.tsx`

| | |
|--|--|
| **Purpose** | Persistent shell: header, nav, `<Outlet />` for child routes |
| **Stage** | 3 |
| **Nav** | `NavLink` to watchlist (active class), login/sign-out based on auth |
| **Tell reviewer** | "Layout route pattern — frame stays, page content swaps in Outlet." |

### `src/components/ProtectedRoute.tsx`

| | |
|--|--|
| **Purpose** | Redirects unauthenticated users to `/login` with return path in location state |
| **Stage** | 3 |
| **Tell reviewer** | "Wraps edit page only — list and detail are public." |

### `src/components/SearchPanel.tsx`

| | |
|--|--|
| **Purpose** | Book/movie toggle, search input, results list, Add buttons |
| **Stage** | 2 |
| **Uses** | `useMediaSearch`, `searchMappers` id helpers |
| **Tell reviewer** | "Shows Added state via Set lookup. Handles missing TMDB key for movies." |

### `src/components/WatchlistItemCard.tsx`

| | |
|--|--|
| **Purpose** | One watchlist row: title link, meta, status, rating, remove button |
| **Stage** | 2 (enhanced in Stage 3 with router links) |
| **Uses** | `useMatch` for selected styling; passes `filterQuery` in link state |
| **Tell reviewer** | "Title links to detail page. Selected card highlights when URL matches." |

### `src/components/ErrorBoundary.tsx`

| | |
|--|--|
| **Purpose** | Class component catching React **render** errors |
| **Stage** | 2 |
| **Tell reviewer** | "Does not catch event handler or async errors — those use try/catch or error state." |

---

## `src/pages/` — full-screen routes

### `src/pages/WatchlistPage.tsx`

| | |
|--|--|
| **Purpose** | Main page: SearchPanel + filter dropdowns + filtered card list |
| **Stage** | 2 (page split in Stage 3) |
| **Wires** | `useWatchlistData`, `useWatchlistFilters`, `filterWatchlistItems`, mappers on add |
| **Tell reviewer** | "Orchestrator page — owns handlers, delegates display to components." |

### `src/pages/ItemDetailPage.tsx`

| | |
|--|--|
| **Purpose** | Read-only view of one item; Edit and Remove actions |
| **Stage** | 3 |
| **Uses** | `useParams` for id, `getItemById`, back link preserves filters via location state |
| **Tell reviewer** | "404-style handling when id not found." |

### `src/pages/ItemEditPage.tsx`

| | |
|--|--|
| **Purpose** | Form to change status, genre, rating |
| **Stage** | 3 |
| **Uses** | Local form state; submits `WatchlistItemUpdate` via context |
| **Tell reviewer** | "Rating field only meaningful for done status — enforced in context on save." |

### `src/pages/LoginPage.tsx`

| | |
|--|--|
| **Purpose** | Mock sign-in button; redirects back to attempted route |
| **Stage** | 3 |
| **Uses** | `location.state.from` from ProtectedRoute redirect |
| **Tell reviewer** | "Already signed in → immediate redirect away from login." |

---

## `src/styles/` — presentation

### `src/styles/globals.css`

| | |
|--|--|
| **Purpose** | Tailwind entry point (`@tailwind base/components/utilities`) plus the design tokens |
| **Stage** | 4 |
| **Key content** | CSS custom properties for colour, radius, and status colours under `:root` and `.dark` |
| **Tell reviewer** | "This replaced the hand-written `stage2-layout.css` from Stage 2. Every colour is a CSS variable, so dark mode is one class on `<html>` rather than a second stylesheet." |

---

## Stage 4 — styling configuration and UI primitives

### `tailwind.config.js`

| | |
|--|--|
| **Purpose** | Tailwind setup: content globs, `darkMode: ['class']`, token → utility mapping |
| **Stage** | 4 |
| **Tell reviewer** | "The `colors` block maps Tailwind names like `bg-card` onto the CSS variables in `globals.css`, so tokens are declared once and consumed everywhere." |

### `postcss.config.js`

| | |
|--|--|
| **Purpose** | Runs Tailwind and Autoprefixer during the Vite build |
| **Stage** | 4 |

### `src/lib/utils.ts`

| | |
|--|--|
| **Purpose** | `cn()` — merge class names safely |
| **Stage** | 4 |
| **Built on** | `clsx` (conditional class joining) + `tailwind-merge` (conflict resolution) |
| **Tested by** | `src/lib/utils.test.ts` |
| **Tell reviewer** | "Plain string concatenation breaks overrides — `'px-2' + ' px-4'` leaves both classes and the winner depends on CSS order. `cn()` resolves conflicts so the last utility wins predictably." |

### `src/lib/theme.ts`

| | |
|--|--|
| **Purpose** | Single source of truth for light/dark theme |
| **Stage** | 4 |
| **Key exports** | `resolveInitialTheme`, `readStoredTheme`, `applyTheme`, `persistTheme`, `THEME_STORAGE_KEY` |
| **Tested by** | `src/lib/theme.test.ts` |
| **Tell reviewer** | "Both `bootstrap.tsx` and `ThemeToggle` need theme logic, so it lives in one module — the storage key is not duplicated. Reading and writing are separate functions, so an explicit user choice wins but we still follow the OS setting until one is made." |

### `src/components/ui/` — Radix wrappers

| File | Wraps | Notes |
|------|-------|-------|
| `button.tsx` | — (plus Radix `Slot`) | CVA variants and sizes; `asChild` lets a `Link` render with button styling |
| `input.tsx` | — | Styled native input, `forwardRef` for form use |
| `label.tsx` | `@radix-ui/react-label` | Clicking the label focuses its control |
| `badge.tsx` | — | CVA variants for type, genre, and status pills |
| `tabs.tsx` | `@radix-ui/react-tabs` | Movie/book switch with arrow-key navigation |
| `select.tsx` | `@radix-ui/react-select` | Filter dropdowns with keyboard and ARIA support |
| `radio-group.tsx` | `@radix-ui/react-radio-group` | Status and rating choices in the edit form |
| `dialog.tsx` | `@radix-ui/react-dialog` | Focus trap, Escape to close, focus returned to trigger |

| | |
|--|--|
| **Tell reviewer** | "Radix ships behaviour and accessibility with no styling; these thin wrappers add our Tailwind classes. That's why there is no hand-written focus-trap or keyboard-navigation code in this repo." |

### `src/components/watchlistCardVariants.ts`

| | |
|--|--|
| **Purpose** | CVA definition for the watchlist card |
| **Stage** | 4 |
| **Variants** | `status` (`want` / `watching` / `done` accent border), `selected` (focus ring) |
| **Tested by** | `src/components/watchlistCardVariants.test.ts` |
| **Tell reviewer** | "Extracted from the card component so the status → style mapping is declarative and unit-testable without rendering React." |

### `src/components/ThemeToggle.tsx`

| | |
|--|--|
| **Purpose** | Light/dark switch in the header |
| **Stage** | 4 |
| **Tell reviewer** | "State holds the current theme; an effect applies the class; the click handler persists the choice. Persisting only on click is deliberate — before that we keep following the OS setting." |

### `src/components/RemoveItemDialog.tsx`

| | |
|--|--|
| **Purpose** | Confirmation prompt before removing an item |
| **Stage** | 4 |
| **Tell reviewer** | "Destructive action behind a Radix Dialog, used from both the card and the detail page." |

---

# Part D — Stage summaries (concepts)

## Stage 1 — TypeScript utility module

**One sentence:** Typed data model + pure list utilities + async book/movie search — no UI.

| Assignment requirement | File |
|------------------------|------|
| Movie + book data model | `types/watchlistItem.ts` |
| Filter by status | `utils/filterByStatus.ts` |
| Sort by rating | `utils/sortByRating.ts` |
| Group by genre | `utils/groupByGenre.ts` |
| Statistics summary | `utils/statsSummary.ts` |
| Async API + errors | `api/openLibraryClient.ts` |
| Unit tests co-located | `*.test.ts` beside source |
| Bonus: movie search | `api/tmdbClient.ts` |

**Build:** `npm run build` → `dist/`

## Stage 2 — React UI fundamentals

**One sentence:** Single-page React app with components, context, custom search hook, error boundary.

| Concept | Where |
|---------|-------|
| Components + props + events | SearchPanel, WatchlistItemCard |
| Shared list state | WatchlistDataContext |
| Side effects on typing | useMediaSearch + useEffect |
| Cancel stale requests | AbortController |
| API hit → domain object | searchMappers |
| Render crash safety | ErrorBoundary |

**Pattern:** Props down, events up — child components never own the full list.

## Stage 3 — React Router v6

**One sentence:** Multiple pages with URLs, deep links, auth guard, filters in query string.

| Assignment requirement | Implementation |
|------------------------|----------------|
| 3+ pages | WatchlistPage, ItemDetailPage, ItemEditPage, LoginPage |
| Deep-linkable items | `/items/:itemId` |
| Auth guard | ProtectedRoute on edit |
| NavLink active state | AppLayout |
| URL filters | useWatchlistFilters + constants |

**Stage 2 → 3 migration:** Selection-by-click replaced by URL routing; list state moved to context shared across pages.

## Stage 4 — Tailwind, Radix, and component variants

**One sentence:** Hand-written CSS is replaced by a token-driven Tailwind setup, accessible Radix primitives, and CVA variants, with dark mode on top.

| Concept | Where | Why it matters |
|---------|-------|----------------|
| Utility-first styling | Every component's `className` | No separate stylesheet to keep in sync with markup |
| Design tokens | `styles/globals.css` + `tailwind.config.js` | Colours defined once as CSS variables; dark mode reuses them |
| Safe class merging | `lib/utils.ts` (`cn`) | A caller's `className` reliably overrides a component default |
| Component variants | `components/watchlistCardVariants.ts` | Status → style mapping is declarative and testable |
| Accessible behaviour | `components/ui/` (Radix) | Focus trap, keyboard nav, and ARIA come from the primitive |
| Dark mode | `lib/theme.ts` + `ThemeToggle` | One class on `<html>`; applied before first paint |
| Destructive confirmation | `RemoveItemDialog` | Removal now requires an explicit confirm |

**Pattern:** Radix supplies behaviour, Tailwind supplies appearance, CVA maps props to class sets, and `cn()` resolves the conflicts between them.

**Stage 3 → 4 migration:** `styles/stage2-layout.css` was deleted and replaced by `styles/globals.css`; every component moved from semantic class names to utilities plus `ui/` primitives.

---

# Part E — End-to-end data flows

## Flow 1: Search and add a book

```text
User types "dune"
  → SearchPanel setQuery
  → useMediaSearch useEffect
  → searchBooks (openLibraryClient)
  → setResults
User clicks Add
  → onAddBook(result)
  → bookSearchResultToWatchlistItem (searchMappers)
  → addItem (WatchlistDataContext)
  → re-render → new WatchlistItemCard
```

## Flow 2: Filter and refresh

```text
User selects Status = want
  → setStatusFilter('want')
  → useWatchlistFilters updates URL ?status=want
  → filterWatchlistItems recomputes
User refreshes browser
  → URL still has ?status=want
  → useWatchlistFilters reads param
  → same filtered list
```

## Flow 3: Protected edit

```text
User opens /items/movie-1/edit (not signed in)
  → ProtectedRoute sees !isAuthenticated
  → Navigate to /login with state.from = '/items/movie-1/edit'
User clicks Sign in
  → login() writes sessionStorage
  → navigate to from path
  → ItemEditPage renders
User saves
  → updateItem(id, { status, genre, rating })
  → context applies rating rules
  → navigate back to detail
```

## How to read any React file (4 layers)

```text
1. STATE     — useState, useContext, URL params
2. HANDLERS  — onClick, onSubmit, setFilter
3. RENDER    — return (JSX)
4. CHILDREN  — which props go where
```

---

# Part F — Reviewer Q&A (honest answers)

| Question | Answer |
|----------|--------|
| Why no persistence? | Out of scope through Stage 4. Watchlist data lives in React state seeded from `seedWatchlist`. Only the theme choice is persisted. |
| Is auth real? | No — sessionStorage flag for demonstrating ProtectedRoute only. |
| Why 100 tests, not component tests? | The assignment stages focus on UI patterns; the library, API clients, and pure Stage 4 helpers are fully unit tested. Rendering tests would need jsdom and Testing Library, which is a later stage. |
| Why two TypeScript configs? | Library (Node emit to dist/) vs React app (JSX, DOM) have different compilation needs. |
| Does the Tailwind helper end up in the published library? | No. `tsconfig.lib.json` includes `src/lib/index.ts` only, so `lib/utils.ts` and `lib/theme.ts` are app-only and never emitted to `dist/`. |
| Why bootstrap separate from index? | Integrator-ui pattern — tiny entry enables lazy loading later. |
| What happens without TMDB key? | Book search works. Movie tab shows unavailable message; no crash. |
| Immutable updates? | Always copy arrays/objects (`filter`, spread) — React detects changes by reference. |
| ErrorBoundary vs search errors? | Boundary catches render bugs. Search errors show inline via hook `error` state. |
| Why Radix rather than writing the dialog yourself? | A correct modal needs a focus trap, Escape handling, focus restore, scroll lock, and ARIA wiring. Radix provides all of it unstyled, so we only supply appearance. |
| Why is `cn()` needed at all? | Tailwind classes do not cascade by source order. Without `tailwind-merge`, a caller passing `px-8` to a component whose default is `px-4` gets an unpredictable result. |
| Is dark mode a second stylesheet? | No — the `.dark` class on `<html>` swaps the CSS variable values that every utility already reads. |
| What's not implemented yet? | Redux, localStorage persistence, i18n, advanced testing, MFE deployment (Stages 5–9). |

---

# Part G — Tests and CI

## Test inventory

| Metric | Value |
|--------|-------|
| Test files | 13 |
| Tests | 100 |
| Runner | Vitest |
| Environment | Node (not jsdom) |

## Test files (all `*.test.ts`)

| File | Tests |
|------|-------|
| `config.test.ts` | Config / env helpers |
| `types/watchlistItem.test.ts` | Type guards |
| `utils/filterByStatus.test.ts` | Status filter |
| `utils/sortByRating.test.ts` | Rating sort |
| `utils/groupByGenre.test.ts` | Genre grouping |
| `utils/statsSummary.test.ts` | Stats aggregation |
| `utils/filterWatchlistItems.test.ts` | Combined UI filters |
| `utils/searchMappers.test.ts` | Search → item mapping |
| `api/openLibraryClient.test.ts` | Book API client |
| `api/tmdbClient.test.ts` | Movie API client |
| `lib/utils.test.ts` | `cn()` class merging and conflict resolution |
| `lib/theme.test.ts` | Stored vs system theme precedence, apply, persist |
| `components/watchlistCardVariants.test.ts` | Status and selected card variants |

The Stage 4 tests run in the same Node environment as the rest: `cn()` and the CVA variants are pure string functions, and the theme tests stub `window` and `document` with `vi.stubGlobal`. No browser environment is required.

## Commands

```bash
npm install
cp .env.example .env    # optional TMDB key
npm run dev             # http://localhost:5173 (typical Vite port)
npm test                # 100 tests
npm run build           # Stage 1 → dist/
npm run build:app       # React → build/
npx tsc -b              # full type-check (also in CI)
```

## Regenerate this PDF

```bash
npx md-to-pdf docs/WatchLog-Complete-Guide.md --stylesheet docs/pdf-style.css
```

Output: `docs/WatchLog-Complete-Guide.pdf` (local only, gitignored)

---

# Part H — Study checklist before review

## Stage 1

- [ ] Explain discriminated union (`item.type === 'movie'`)
- [ ] Walk through one pure function (e.g. `filterByStatus`)
- [ ] Explain sync utils vs async `searchBooks`
- [ ] Point to central `config.ts`

## Stage 2

- [ ] Props down / events up with SearchPanel example
- [ ] Why `useEffect` in `useMediaSearch`
- [ ] What AbortController prevents
- [ ] ErrorBoundary scope (render only)

## Stage 3

- [ ] Draw route table from memory
- [ ] Explain `<Outlet />` layout pattern
- [ ] How URL filters survive refresh
- [ ] ProtectedRoute + login redirect flow

## Stage 4

- [ ] Explain what a design token is and where the colours are defined
- [ ] Explain why `cn()` exists (Tailwind conflicts, not just concatenation)
- [ ] Explain what Radix gives you and what it deliberately does not
- [ ] Show one CVA variant and the props that select it
- [ ] Trace the dark-mode path: toggle → class on `<html>` → CSS variables
- [ ] Explain why the theme is applied in `bootstrap.tsx` before React mounts

---

# Part I — Future stages (not in submission)

| Stage | Expected topic |
|-------|----------------|
| 5 | Global state (Redux) and persistence (localStorage / API) |
| 6 | Advanced testing (integration / E2E) |
| 7 | Performance and code splitting |
| 8 | Internationalization |
| 9 | Production / micro-frontend deployment |

Confirm exact deliverables on your official learning canvas — titles may vary.

---

**End of reviewer guide.**  
Trust the `main` branch as source of truth for Stages 1–4.
