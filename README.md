# WatchLog — Stage 3

WatchLog is a beginner React 19 app for tracking movies and books. Stage 3 keeps
the Stage 1 library and Stage 2 search behavior, then adds React Router.

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
├── components/   Shared layout, route guards, search, and cards
├── context/      Shared watchlist data and mock authentication
├── hooks/        Abortable search and URL-backed filters
├── pages/        Watchlist, detail, edit, and login routes
├── types/        Movie and book data types
├── utils/        Reusable transformations
├── index.tsx     Direct browser entry
└── lib/index.ts  Reusable library entry
```

Tests live beside the files they cover as `*.test.ts`.

The watchlist is at `/watchlist`. Type and status filters live in its query
string, item details live at `/items/:itemId`, and editing requires mock sign-in.

See [STAGE-3.md](./STAGE-3.md) for the route map and guided edit flow.
