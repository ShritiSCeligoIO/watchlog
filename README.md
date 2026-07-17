# WatchLog — Stage 1

TypeScript utility kit for a personal movie and book watchlist. Stage 1 is a pure library (no UI): typed data model, list utilities, book/movie search APIs, and unit tests.

## Prerequisites

- Node.js 22.11.0 (same as integrator-ui)
- npm

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` and add your [TMDB API key](https://www.themoviedb.org/settings/api) for movie search. Open Library book search works without a key.

## Scripts

| Command | Description |
|---------|-------------|
| `npm test` | Run all unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run build` | Compile `src/` to `dist/` |

## Project structure

```text
src/
├── types/          WatchlistItem data model
├── utils/          filter, sort, group, stats
├── api/            Open Library + TMDB clients
├── fixtures/       Shared mock data for tests
└── config.ts       Environment variables (single source)
```

Tests live beside source files (`*.test.ts`), matching integrator-ui conventions.

## Try a live search

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

## Stage 2+

When you add a React app entry point, call `validateMovieSearchConfig()` from `config.ts` at startup if the app uses movie search — it fails fast when `TMDB_API_KEY` is missing.

## Repository

https://github.com/ShritiSCeligoIO/watchlog
