# WatchLog — Stage 1

Stage 1 is a small TypeScript library for a movie and book watchlist. It has no
user interface yet. It defines the data, transforms watchlist items, and searches
two public APIs.

## Requirements

- Node.js 22.11.0
- npm
- A TMDB API key only when using movie search

## Setup

```bash
npm install
cp .env.example .env
```

Add a [TMDB API key](https://www.themoviedb.org/settings/api) to `.env` for
movie search. Open Library book search does not need a key.

## Commands

```bash
npm test
npm run test:watch
npm run build
```

`npm run build` compiles the library from `src/` into `dist/`.

## Project structure

```text
src/
├── types/          MovieItem, BookItem, and type guards
├── utils/          Filter, sort, group, and statistics functions
├── api/            Open Library and TMDB clients
├── fixtures/       Realistic test data
└── config.ts       The only environment-variable reader
```

Tests live beside the files they cover as `*.test.ts`.

The API key is validated in two places:

- `validateMovieSearchConfig()` supports fail-fast validation at app startup.
- `searchMovies()` rejects a call that has no key.

The validation error uses the structured message
`logName=requiredEnvVarMissing, envVar=TMDB_API_KEY`. A future application must
log it through its approved logger; this library does not write to the console.

See [STAGE-1.md](./STAGE-1.md) for the beginner walkthrough.
