# WatchLog — Stage 2

WatchLog is a beginner React 19 app for tracking movies and books. Stage 2 keeps
the reusable TypeScript library from Stage 1 and adds a single-page list/detail
interface.

## Requirements

- Node.js 22.11.0
- npm
- A TMDB API key only for movie search

## Setup

```bash
npm install
cp .env.example .env
```

Add a [TMDB API key](https://www.themoviedb.org/settings/api) to `.env` for
movie search. Book search works without a key.

## Commands

```bash
npm test
npm run test:watch
npm run build
npm run build:app
npm run dev
```

`npm run build` creates the reusable library in `dist/`. `npm run build:app`
creates the browser app in `build/`.

## Project structure

```text
src/
├── api/          Open Library and TMDB clients
├── components/   Search, list, cards, details, and error UI
├── context/      Shared watchlist and selection state
├── hooks/        Search and filter behavior
├── types/        Movie and book data types
├── utils/        Reusable transformations
├── index.tsx     Direct browser entry
└── lib/index.ts  Reusable library entry
```

Tests live beside the files they cover as `*.test.ts`.

See [STAGE-2.md](./STAGE-2.md) for the mental model and guided user flow.
