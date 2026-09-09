# WatchLog — Stage 7

WatchLog is a beginner React 19 app for tracking movies and books.
Stage 7 adds internationalization, reusable compound components, and measured
performance improvements without changing the Stage 6 state model.

## What is included

- English bundled with the app
- Spanish loaded only when selected
- Browser and saved-language detection
- Typed translation keys and locale completeness checks
- Locale-aware numbers, percentages, and dates
- A six-part compound `ItemCard` shared by list and detail pages
- Optimizations backed by repeatable render measurements
- Zustand UI state, TanStack Query server state, and URL filters from Stage 6

## Setup

Use Node.js 22.11.0 and npm.

```bash
npm install
cp .env.example .env
npm run dev
```

Book search works without configuration. Movie search needs `TMDB_API_KEY`.
Every environment variable is loaded in `src/config.ts` and declared in
`env.yaml`.

## Checks

```bash
npm test
npm run typecheck
npm run typecheck:locales
npm run build:lib
npm run build:app
```

## Read next

- [STAGE-7.md](./STAGE-7.md) explains the implementation in beginner terms.
- [docs/performance-audit.md](./docs/performance-audit.md) records the profiling
  method, before/after numbers, and tradeoffs.
