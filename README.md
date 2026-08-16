# WatchLog — Stage 4 complete

Personal movie and book watchlist. Stage 1 is a TypeScript library; Stage 2 added React UI; Stage 3 added React Router; Stage 4 restyles the app with Tailwind CSS, Radix UI, and CVA component variants.

## Prerequisites

- Node.js 22.11.0 (same as integrator-ui)
- npm

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` at the **repo root** (same folder as `package.json`):

- **Book search** — works with no API key (Open Library).
- **Movie search** — set `TMDB_API_KEY` (Vite exposes it to the browser via `envPrefix`; restart `npm run dev` after changes).

Get a free TMDB key: https://www.themoviedb.org/settings/api

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (React app) |
| `npm test` | Run all unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run build` | Compile Stage 1 library (`src/` → `dist/`) |
| `npm run build:app` | Production React bundle (`src/` → `build/`) |

## Stage 4 features

- **Tailwind CSS** — utility-first styling with design tokens (color, spacing, radius) via CSS variables
- **PostCSS pipeline** — `postcss.config.js` + `tailwind.config.js`
- **`cn()` helper** — `clsx` + `tailwind-merge` for safe class merging (shadcn pattern)
- **CVA variants** — watchlist card borders/colors vary by status (`want`, `watching`, `done`)
- **Radix UI** — accessible Select, RadioGroup, Tabs, and Dialog primitives
- **Dark mode** — class-based theme toggle (`src/lib/theme.ts`), applied before first paint, preference persisted
- **Remove confirmation** — Radix Dialog with focus trap, Escape to close, focus return

## Stage 3 features

- **Multi-page routing** — `BrowserRouter`, nested routes, `Outlet` layout
- **Pages** — `/watchlist` (list), `/items/:itemId` (detail), `/items/:itemId/edit` (edit)
- **Deep links** — every item has a shareable URL
- **Auth guard** — edit page protected; mock sign-in at `/login`
- **NavLink** — active section highlight in the nav bar
- **URL filters** — `?type=movie&status=want` survives refresh (`useSearchParams`)

## Stage 2 features (still in the app)

- **SearchPanel** — book + movie search with loading/error states
- **useMediaSearch** — custom hook with `AbortController` cancel on re-type
- **ErrorBoundary** — catches render errors at the app root

## Project structure

Flat layout — fewer folders, one file per thing:

```text
WatchLog/
├── vite.config.ts
├── tsconfig.json
├── tsconfig.lib.json       Stage 1 library → dist/
├── tsconfig.app.json       React UI type-checking
│
└── src/
    ├── index.html
    ├── index.tsx           Lazy entry → bootstrap
    ├── bootstrap.tsx       ReactDOM mount + BrowserRouter + ErrorBoundary
    ├── App.tsx             Route definitions + providers
    ├── pages/              WatchlistPage, ItemDetailPage, ItemEditPage, LoginPage
    ├── fixtures/seedWatchlist.ts   Starting watchlist data
    ├── utils/searchMappers.ts      Search hit → watchlist item
    ├── components/         SearchPanel, cards, AppLayout, ThemeToggle, ui/
    ├── hooks/              useMediaSearch, useWatchlistFilters
    ├── context/            WatchlistDataContext, AuthContext
    ├── constants/          Min search length, etc.
    ├── lib/                Stage 1 public barrel export + app helpers (cn, theme)
    ├── types/              WatchlistItem data model
    ├── utils/              filter, sort, group, stats (Stage 1)
    ├── api/                Open Library + TMDB clients
    ├── fixtures/           Shared mock data for tests
    ├── styles/globals.css  Tailwind + design tokens
    └── config.ts           Environment variables (single source)
```

Tests live beside source files (`*.test.ts` / `*.test.tsx`), matching integrator-ui conventions.

## Try a live search (Stage 1 library)

```bash
npm run build

# Books (no API key)
node --input-type=module -e "
  import { searchBooks } from './dist/api/openLibraryClient.js';
  console.log(await searchBooks('dune'));
"

# Movies (requires TMDB_API_KEY in .env)
node --input-type=module -e "
  import { searchMovies } from './dist/api/tmdbClient.js';
  console.log(await searchMovies('dune'));
"
```

## Environment validation

- **Browser** — `bootstrap.tsx` calls `warnIfMovieSearchUnavailable()` if `TMDB_API_KEY` (or `VITE_TMDB_API_KEY`) is missing (movie search shows an error from the API client).
- **Node/CLI** — call `validateMovieSearchConfig()` before movie search scripts; it exits non-zero when `TMDB_API_KEY` is missing.

## Stage 2 + 3 submission checklist

Use this before you demo or submit tomorrow:

| Check | How to verify |
|-------|----------------|
| All tests pass | `npm test` |
| Library builds | `npm run build` |
| App builds | `npm run build:app` |
| Type-check | `npx tsc -b` |
| Dev server | `npm run dev` → open `/watchlist` |
| URL filters | Change type/status → URL updates; refresh keeps filters |
| Deep links | Open `/items/movie-1` directly |
| Auth guard | Visit `/items/movie-1/edit` while signed out → `/login` |
| Edit flow | Sign in → edit status/genre/rating → detail page updates |
| Search | Book search works without API key; movie search needs `.env` |

**Note for reviewers:** Stage 2 originally used React Context for list selection. Stage 3 replaced that with URL-based routing (`/items/:itemId`) and `WatchlistDataContext` for shared watchlist state. Selection is now driven by the route, not a separate selection context.

Watchlist data resets on refresh — persistence is planned for a later stage.

## Repository

https://github.com/ShritiSCeligoIO/watchlog
