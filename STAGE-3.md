# Stage 3 — Routing and URL State

## Gist

Stage 3 gives WatchLog several pages without giving up its React foundations.

React Router connects a URL to the component that should render.
The browser history now records movement between the watchlist, details, edit
form, and login.

- `itemId` in the URL chooses the current item.
- Query parameters own the watchlist filters.
- Auth Context owns the mock signed-in state.
- Watchlist Context still owns the item data.
- Search remains local, debounced, and abortable.

`SelectionContext` is gone.
The selected detail panel is also gone.
An item detail is now a full route with a URL that can be refreshed or shared.

## URL mental model

A URL can contain a path and a query string:

```text
/watchlist?type=book&status=want
└── path   └── query parameters
```

The path answers, “Which page is this?”
The query string answers, “Which view of that page?”

```text
/items/book-2
        └── itemId
```

`:itemId` is a route parameter.
`useParams()` reads it inside the detail and edit pages.
Those pages ask `WatchlistDataContext` for the matching item.

The URL is the source of truth for selection.
There is no second selected ID in React state to synchronize.

For filters:

```text
/watchlist?type=movie&status=done
```

`useSearchParams()` reads and writes `type` and `status`.
Changing a select updates the URL.
Refreshing or sharing that URL recreates the same filtered view.

URL values are external input.
The hook accepts only known type and status values.
A value such as `?type=podcast&status=paused` safely displays the default
all-types and all-statuses view.

Default values are omitted from the URL.
This keeps `/watchlist` equivalent to the unfiltered view.

## Route map

The route table stays visible in `src/App.tsx`.

```text
/                      redirect to /watchlist
/watchlist             search, filters, and item cards
/items/:itemId         one item's details
/items/:itemId/edit    protected edit form
/login                 mock sign-in
*                      redirect to /watchlist
```

All routes are nested under `AppLayout`.
The layout renders the heading and navigation once.
`Outlet` marks where the matching child page appears.

`BrowserRouter` wraps the app in `src/index.tsx`.
It listens to browser history and makes router hooks available.

The index and catch-all routes use `Navigate` with `replace`.
Replacing avoids leaving useless redirect entries in browser history.
## Key files
### `src/index.tsx`

This is the browser entry.
It keeps Strict Mode and the error boundary from Stage 2.
`BrowserRouter` is the new outer routing provider.
### `src/App.tsx`

This file contains the complete route table.
It also places Auth and watchlist providers around every route.

The small `EditItemRoute` reads `itemId` and gives the edit page
`key={itemId}`.
That key resets form state if navigation changes directly from one edit URL to
another.
### `src/components/AppLayout.tsx`

The layout renders the shared heading and navigation.
Its `Outlet` renders the current nested page.
The sign-in or sign-out control reflects Auth Context.
### `src/pages/WatchlistPage.tsx`

This page composes the existing search panel, URL filters, and item cards.
It filters the shared watchlist during render.
Each card links to `/items/:itemId`.

The current filter query travels in navigation state.
The detail page uses it for “Back to watchlist.”
### `src/hooks/useWatchlistFilters.ts`

This hook replaces Stage 2 local filter state with URL search parameters.
It validates query values before using them.
It preserves one filter when the other changes.
### `src/pages/ItemDetailPage.tsx`

The page reads `itemId` with `useParams`.
It handles both a matching item and an unknown ID.
Movie and book type guards still control their specific fields.

Edit, remove, and back actions are visible together.
Removing the item returns to the previous filtered watchlist when possible.
### `src/components/ProtectedRoute.tsx`

This component checks mock authentication.
A signed-out visitor is redirected to `/login`.
The requested path is saved as `state.from`.

After sign-in, the login page returns to that path.
This prevents a protected-route redirect from losing the user's intent.
### `src/context/AuthContext.tsx`

Auth Context exposes `isAuthenticated`, `login`, and `logout`.
It uses `sessionStorage` so the mock session survives a reload in the same tab.

This is teaching code, not production authentication.
There are no credentials, server session, authorization checks, or tokens.
### `src/pages/ItemEditPage.tsx`

The form starts from the item found through `itemId`.
It edits status, genre, and rating.

Rating rules are explicit:

- Only `done` items keep a rating.
- Ratings range from one to five.
- “No rating” sends `null` to remove an existing rating.
- Changing status away from `done` removes the rating.

Saving calls `updateItem` and navigates to the detail route.
Cancel returns without changing data.
### `src/types/watchlistItem.ts`

`WatchlistItemUpdate` permits `null` only as an edit instruction for rating.
Stored watchlist items still use an optional one-to-five rating.

`applyWatchlistItemUpdate` enforces the rating rules in one tested function.
The data Context uses that function when replacing the matching item.
### `src/hooks/useMediaSearch.ts`

Search behavior remains from Stage 2.
Typing waits for the debounce before requesting data.
Effect cleanup clears the timer and aborts stale requests.

Expected aborts do not become errors.
Real failures clear stale results and show an error.

## One navigation and edit flow

1. Open `/watchlist`.
2. Set Type to Books.
3. Set Status to Want.
4. Notice `?type=book&status=want` in the address bar.
5. Refresh and see the filters remain selected.
6. Choose `Dune` or its View link.
7. The URL becomes `/items/book-2`.
8. The detail page gets `book-2` from `useParams`.
9. Choose Edit.
10. Because edit is protected, a signed-out user goes to `/login`.
11. `ProtectedRoute` stores `/items/book-2/edit` in `state.from`.
12. Choose Sign in.
13. Login returns to the edit URL.
14. Change Status to Done.
15. Choose a rating from one to five, or leave No rating.
16. Choose Save.
17. `updateItem` replaces only `book-2`.
18. The app navigates to `/items/book-2`.
19. The detail page displays the updated status and optional rating.
20. Choose Back to watchlist.

This flow crosses path parameters, query parameters, navigation state, mock
auth, Context data, controlled form state, and programmatic navigation.

## Commands

Install the exact dependencies:

```bash
npm install
```

Run tests:

```bash
npm test
```

Type-check the browser app:

```bash
npx tsc -p tsconfig.app.json
```

Build the reusable library:

```bash
npm run build:lib
```

Build the Vite app:

```bash
npm run build:app
```

Start local development:

```bash
npm run dev
```

Movie search needs `TMDB_API_KEY` in a root `.env` file.
Book search works without it.
Environment reads stay centralized in `src/config.ts`, and both variables stay
registered in `env.yaml`.

## Transition to Stage 4

Stage 3 stores watchlist changes only in React memory.
Refreshing restores the seed list, although routes and filters remain in the
URL.

Stage 4 can introduce persistence and server data.
That transition will add loading, mutation, and failure questions.
The route structure from this stage can remain while the data source changes.
