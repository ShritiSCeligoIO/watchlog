# Stage 2 — React Foundations

## Gist

Stage 2 turns the Stage 1 TypeScript library into a small React 19 app.

The app has one screen and two columns:

- Search, filters, and the watchlist are on the left.
- Details for the selected item are on the right.

There is deliberately no router yet.
Filters and selection live only in memory.
Refreshing the page resets them and restores the seed data.

## Mental model

React renders the screen from data.

When state changes, React calls the affected components again.
Those components return a new description of the screen.
React updates only the necessary DOM.

WatchLog has three kinds of data:

1. Shared watchlist data
2. Shared selection data
3. Local interface data

The watchlist belongs to `WatchlistDataContext`.
Many components need to read or change it.

The selected item belongs to `SelectionContext`.
A card sets the selection while the detail panel reads it.
These components are siblings, so Context avoids passing selection through
components that do not use it.

Search text, search type, and filters are local state.
Only their nearby interface needs them.

Context is not a replacement for every prop.
`WatchlistItemCard` still receives its item as a prop.
The parent owns the list and naturally decides which item each card displays.

Use a prop when a parent directly supplies data to a child.
Use Context when distant or sibling components need the same data.

## Key files

### `src/index.tsx`

This is the direct browser entry.
It finds the root DOM element and renders the app.
There is no dynamic bootstrap layer.

### `src/App.tsx`

This file composes the providers and page heading.
It does not own watchlist behavior.

### `src/context/WatchlistDataContext.tsx`

This provider owns the array of watchlist items.
It exposes `items`, `addItem`, `removeItem`, and `getItemById`.

Updates create new arrays.
React can then see that state changed and render again.

Duplicate IDs are ignored when an item is added.

### `src/context/SelectionContext.tsx`

This provider owns `selectedId`.
It exposes functions to select an item or clear the selection.

The context value is intentionally direct.
There is no early `useMemo` or `useCallback` optimization.
The smaller version makes the data flow easier to see.

### `src/components/WatchlistView.tsx`

This component creates the two-column layout.
It applies the current type and status filters.
Filtering is local and inexpensive, so it runs directly during render.

An empty message appears when no item matches.

### `src/components/WatchlistItemCard.tsx`

Each card receives one item as a prop.
It reads shared selection and removal actions from Context.

The selected card gets a visible highlight.

### `src/components/ItemDetailPanel.tsx`

The detail panel receives no props.
It combines the selected ID from one Context with item data from the other.

Type guards from Stage 1 decide whether to show movie or book fields.

### `src/components/SearchPanel.tsx`

The search input is controlled.
Its displayed value always comes from React state.
Every edit calls `setQuery` to update that state.

The panel renders short-query, unavailable, loading, error, empty, successful,
and already-added states.

### `src/hooks/useMediaSearch.ts`

This hook owns query, results, loading, and error state.

It waits 350 milliseconds after input changes.
That debounce avoids sending a request for every keystroke.

Each effect creates an `AbortController`.
Changing the query or media type clears the timer and aborts active work.

An aborted request is expected and is not shown as an error.
A real failure clears old results and produces an error message.

### `src/hooks/useWatchlistFilters.ts`

This hook keeps type and status filters in component state.
The values are not saved and are not represented in the URL.

That limitation is intentional for Stage 2.

### `src/utils/filterWatchlistItems.ts`

This pure function applies the local filters.
It builds on the Stage 1 `filterByStatus` utility.

### `src/utils/searchMappers.ts`

Search APIs return search-result shapes.
The watchlist stores `BookItem` and `MovieItem` shapes.
These functions convert between the two.

New items start with status `want` and today's date.

### `src/config.ts`

All environment reads remain centralized here.
The same names work in Node and in the Vite browser build.

`OPEN_LIBRARY_BASE_URL` has a safe default.
`TMDB_API_KEY` stays optional until movie search is used.
The Node validation function retains its structured missing-variable error.

Both variables remain declared in `env.yaml`.

## One user flow

Follow a book from search to removal:

1. Run `npm run dev`.
2. Open the local URL printed by Vite.
3. Leave the search type set to Books.
4. Type at least three characters.
5. Pause briefly for the debounce.
6. The panel shows `Searching…`.
7. Results replace the loading state.
8. Choose `Add` on one result.
9. The mapped book appears in the watchlist with status `want`.
10. The same search result now says `Added`.
11. Choose the title or `View` on the new card.
12. The card receives the selected highlight.
13. The right column shows its details.
14. Choose `Remove`.
15. The item disappears and selection clears.

This flow crosses local state, an effect, both API and mapping code, shared
watchlist Context, shared selection Context, props, and conditional rendering.

## Run commands

Install exact dependencies:

```bash
npm install
```

Run the test suite once:

```bash
npm test
```

Build the reusable library:

```bash
npm run build
```

Build the Vite application:

```bash
npm run build:app
```

Start the development server:

```bash
npm run dev
```

Movie search needs `TMDB_API_KEY` in a root `.env` file.
Book search does not need a key.
Restart Vite after changing `.env`.

## Transition to Stage 3

Local state is enough for one screen, but it has limits.

The selected item cannot be opened with a shareable URL.
Filter choices disappear on refresh.
Browser back and forward buttons cannot move between list and detail views.

Stage 3 introduces routing to address those limitations.
The Stage 2 Context and component lessons remain useful.
Routing changes where navigation state lives, not the basic React data flow.
