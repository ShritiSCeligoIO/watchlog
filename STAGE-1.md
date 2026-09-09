# Stage 1 — A small TypeScript library

## The gist

Stage 1 builds the rules behind WatchLog before it builds a screen.

By the end of this stage, the project can:

- describe movies and books safely,
- filter, sort, group, and summarize a watchlist,
- search Open Library and TMDB,
- read configuration in one place,
- prove its behavior with Vitest, and
- compile into a reusable JavaScript library.

There is no React code and no browser screen yet. That starts in Stage 2.

## The mental model

Think of the project as three layers:

1. **Data:** What does a valid watchlist item look like?
2. **Rules:** What can we calculate from a list of items?
3. **Boundaries:** How do we safely receive data from APIs and configuration?

Tests sit beside all three layers. The build turns TypeScript into JavaScript.

```text
input data -> typed rule -> result
API data   -> validation -> app-friendly result
```

TypeScript checks code while you write it. It does not validate API data while
the program is running, so the API clients still perform runtime checks.

## Key files

```text
src/
├── types/watchlistItem.ts
├── utils/
│   ├── filterByStatus.ts
│   ├── sortByRating.ts
│   ├── groupByGenre.ts
│   └── statsSummary.ts
├── api/
│   ├── openLibraryClient.ts
│   └── tmdbClient.ts
├── fixtures/mockWatchlist.ts
├── config.ts
└── index.ts
```

Each public function has a nearby `.test.ts` file.

## 1. The data model

Every item shares a few fields:

```typescript
interface BaseWatchlistItem {
  id: string;
  title: string;
  genre: string;
  status: 'want' | 'watching' | 'done';
  dateAdded: string;
  rating?: 1 | 2 | 3 | 4 | 5;
}
```

The `?` means that `rating` is optional.

Movies and books add different fields:

```typescript
interface MovieItem extends BaseWatchlistItem {
  type: 'movie';
  director?: string;
  releaseYear?: number;
}

interface BookItem extends BaseWatchlistItem {
  type: 'book';
  author?: string;
  publishYear?: number;
}

type WatchlistItem = MovieItem | BookItem;
```

This is a **discriminated union**. The `type` field tells TypeScript which member
of the union it has.

```typescript
if (item.type === 'book') {
  // TypeScript knows that item is a BookItem here.
  const author = item.author;
}
```

This is safer than one large interface where every movie and book field is
optional.

## 2. Type guards

A type guard packages a runtime check in a reusable function:

```typescript
function isMovieItem(item: WatchlistItem): item is MovieItem {
  return item.type === 'movie';
}
```

The return type `item is MovieItem` helps TypeScript narrow the union after the
function returns `true`.

Stage 1 provides:

- `isMovieItem`
- `isBookItem`
- `hasRating`

The guards are ordinary functions, so their true and false behavior is tested.

## 3. Pure utility functions

A pure function returns the same result for the same input and does not change
anything outside itself.

Stage 1 has four:

- `filterByStatus(items, status)` keeps matching items.
- `sortByRating(items, direction)` sorts ratings and puts unrated items last.
- `groupByGenre(items)` creates one array for each genre.
- `statsSummary(items)` calculates count, completion rate, and average rating.

The functions do not modify the input array.

`sortByRating` copies before using JavaScript's in-place `sort`:

```typescript
return [...items].sort(compareItems);
```

`groupByGenre` creates a new result object. It may push into arrays owned by that
new object because those arrays were not supplied by the caller.

`statsSummary` handles two easy-to-miss cases:

- an empty list has a completion rate of `0`,
- no rated, completed items means an average rating of `null`.

An unrated completed item counts as completed but does not count toward the
rating average.

## 4. One complete data flow

Consider `statsSummary(mockWatchlist)`:

1. `mockWatchlist` supplies five realistic movie and book objects.
2. `statsSummary` counts all five items.
3. It keeps items whose status is `done`.
4. It uses `hasRating` to keep rated completed items.
5. It divides their rating total by their count.
6. It returns a new summary object.
7. The test checks `{ totalCount: 5, completionRate: 0.4, averageRating: 4.5 }`.

No network, file, clock, or global state is involved. That makes the function
fast and straightforward to test.

## 5. API clients

`searchBooks` talks to Open Library. `searchMovies` talks to TMDB.

Both functions:

1. trim and validate the search text,
2. validate the requested result limit,
3. build a URL with `URL` and `URLSearchParams`,
4. await `fetch`,
5. reject unsuccessful HTTP responses,
6. parse JSON with error handling,
7. check the external response shape, and
8. map valid records into small local result objects.

The clients throw `OpenLibraryError` or `TmdbError` with context instead of
silently returning an empty list after a failure.

The tests replace `fetch` with a mock. Tests should not depend on internet
access or real API accounts.

TMDB requires a secret API key. Open Library does not.

## 6. Configuration

Only `src/config.ts` reads `process.env`.

Safe public settings have defaults:

```typescript
OPEN_LIBRARY_BASE_URL=https://openlibrary.org
```

`TMDB_API_KEY` has no meaningful default because it is a secret. A future app
that enables movie search should call `validateMovieSearchConfig()` during
startup and handle its structured error with the approved application logger.

The library itself never writes to the console.

`.env.example` documents local setup. `env.yaml` registers both variables for
deployment configuration.

## 7. Tests and build

Vitest runs the tests:

```bash
npm test
```

Watch mode reruns affected tests while you edit:

```bash
npm run test:watch
```

TypeScript builds the library:

```bash
npm run build
```

Compiled JavaScript, type declarations, and source maps are written to `dist/`.
Dependencies in `package.json` use exact versions so installs stay predictable.

## Transition to Stage 2

Stage 2 adds React and turns this library into a visible application. It reuses
the model, fixtures, utility functions, and clients built here.

Request cancellation with `AbortSignal` is introduced in Stage 2, where search
requests can become stale while a user types. Stage 1 does not claim or
implement cancellation.
