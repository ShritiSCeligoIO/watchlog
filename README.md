# WatchLog — Stage 5

WatchLog is a beginner React 19 app for tracking movies and books. Stage 5
keeps the Stage 4 UI and routing while moving shared state to Redux Toolkit.
Redux Saga handles search and mock-auth side effects.

## Requirements

- Node.js 22.11.0
- npm
- A TMDB API key only for movie search

## Setup

```bash
npm install
cp .env.example .env
```

Add a [TMDB API key](https://www.themoviedb.org/settings/api) to `.env` if you
want movie search. Book search works without a key.

## Commands

```bash
npm test
npx tsc -p tsconfig.app.json
npm run build:lib
npm run build:app
npm run dev
```

The app opens at the URL printed by Vite. `build:lib` creates the reusable
library in `dist/`; `build:app` creates the browser app in `build/`.

## What Stage 5 adds

- Feature-organized auth, search, and watchlist slices
- A configured store, typed hooks, root reducer, and root saga
- Debounced, cancellable search with selective transient retries
- Pure watchlist reducers for adding, removing, and editing items
- Reselect selectors for URL-filtered items and statistics
- Redux DevTools support

Watchlist changes remain in memory. Filters intentionally remain in the URL so
filtered views survive refreshes and can be shared.

See [STAGE-5.md](./STAGE-5.md) for the mental model and guided data flow.
