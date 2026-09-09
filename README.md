# WatchLog — Stage 6

WatchLog is a beginner React 19 app for tracking movies and books. Stage 6
keeps the existing UI and routes while replacing Redux with:

- Zustand for state owned by this browser tab
- TanStack Query for data copied from an API
- URL search parameters for shareable filters

## Setup

Use Node.js 22.11.0 and npm.

```bash
npm install
cp .env.example .env
npm run dev
```

Book search works without configuration. Movie search needs a TMDB API key:

```text
TMDB_API_KEY=your_key
```

All environment variables are read in `src/config.ts` and declared in
`env.yaml`.

## Commands

```bash
npm test
npx tsc -p tsconfig.app.json --noEmit
npm run build:lib
npm run build:app
npm run dev
```

## Stage 6 structure

```text
src/
├── stores/             UI-owned state and mock auth
├── queries/            Query client and cache keys
├── features/search/    Debounced remote search query
├── features/watchlist/ Mock backend, queries, and mutations
├── hooks/              URL filters and debounce helper
└── utils/              Shared watchlist business rules
```

The mock watchlist is asynchronous but not durable. It resets from
`seedWatchlist` after a reload.

Try **Simulate server failure**, then remove an item. The card disappears
optimistically, returns when the write fails, and an error appears.

See [STAGE-6.md](./STAGE-6.md) for the guided explanation and
[docs/state-split.md](./docs/state-split.md) for the field ownership map.
