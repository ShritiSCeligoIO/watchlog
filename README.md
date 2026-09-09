# WatchLog — Stage 4

WatchLog is a beginner React 19 app for tracking movies and books. Stage 4
keeps the data, search, and routing behavior from Stages 1–3 and redesigns the
interface with Tailwind CSS and accessible Radix UI controls.

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

## What Stage 4 adds

- Responsive cards and page layouts
- Light and dark design tokens
- A saved theme choice applied before the first paint
- Keyboard-friendly Tabs, Select, Dialog, and Radio Group controls
- A confirmation dialog before removing an item
- Small reusable UI wrappers in `src/components/ui/`

The application behavior remains local and intentionally simple: mock sign-in,
in-memory watchlist changes, URL-backed filters, Open Library book search, and
optional TMDB movie search.

See [STAGE-4.md](./STAGE-4.md) for the guided explanation and Stage 5 handoff.
