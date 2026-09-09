# Stage 6 — UI state and server state

## Gist

Stage 5 put every changing value in Redux. Stage 6 asks who owns each value
before choosing where it belongs.

- Zustand stores values the app owns.
- TanStack Query caches values an API owns.
- The URL owns filters that should be shareable.

Redux Toolkit, React Redux, Redux Saga, and Reselect are removed. The routes,
forms, Tailwind styles, Radix components, and Stage 1 utilities remain.

## Restaurant and notebook model

Imagine ordering at a restaurant.

Your notebook contains choices you control: the dish you wrote down, whether
you prefer a dark page, and which line you are about to erase. That is UI state.
Nobody in the kitchen can make your notebook stale.

The waiter brings a copy of the kitchen's information: what is available,
whether an order was accepted, and the current status. That is server state.
It can arrive late, fail, or become stale after you receive it.

Zustand is the notebook. TanStack Query is the waiter plus a labelled tray
where recent responses are cached.

## Field ownership

Examples make the boundary concrete:

- `query` and `mediaType` are typed or selected here, so Zustand owns them.
- `theme` is a browser preference, so Zustand owns and persists it.
- `pendingRemoval` is a temporary local intention, so Zustand owns it.
- `simulateWriteFailure` is a local teaching control, so Zustand owns it.
- `isAuthenticated` is mock tab state, so the separate auth store owns it.
- watchlist items come from the mock API, so TanStack Query owns the copy.
- search results come from Open Library or TMDB, so TanStack Query owns them.
- type and status filters remain in the URL.

The concise field map is in `docs/state-split.md`.

## Why filters stay in the URL

A URL such as:

```text
/watchlist?type=movie&status=want
```

survives refresh, supports Back and Forward, and can be shared. Copying those
same values into Zustand would create two sources of truth. The existing
`useWatchlistFilters` hook therefore keeps reading and writing search
parameters.

## Zustand stores

`src/stores/uiSlice.ts` contains four small slice factories:

1. search input
2. theme
3. pending removal
4. development failure control

`src/stores/uiStore.ts` combines them. One type alias hides the middleware
typing so each slice can focus on its fields and actions.

The middleware has three jobs:

- `devtools` names state changes in Redux DevTools.
- `persist` stores only the theme in local storage.
- `immer` keeps updates readable while preserving immutable state.

Search text, a pending dialog, and the failure switch are not persisted. They
should start clean after a reload.

Auth uses `src/stores/authStore.ts`. It persists only the mock signed-in flag to
session storage, so closing the tab signs the user out. It is separate because
theme and auth need different storage lifetimes.

Components subscribe to individual fields:

```typescript
const query = useUiStore((state) => state.query);
```

This makes the dependency visible and avoids rerendering for unrelated fields.

## TanStack Query client

`src/queries/queryClient.ts` owns shared request policy.

Reads retry only errors marked `retryable`. Abort errors, missing keys, and
ordinary client errors are not retried. Retry delay uses a short exponential
backoff.

Writes use `retry: 0`. Repeating a failed write blindly can duplicate work if a
server applied the first request but its response was lost.

Search results stay fresh for five minutes. Watchlist data has a shorter stale
time so invalidation after a write is easy to observe.

`QueryClientProvider` wraps the route tree. Zustand needs no React provider.
TanStack Query Devtools load only in development.

## Cache keys

Every key is created in `src/queries/queryKeys.ts`:

```typescript
queryKeys.watchlist
// ['watchlist']

queryKeys.search('book', 'dune')
// ['search', 'book', 'dune']
```

The media type and debounced text belong in the search key because changing
either requests different data. Retyping the same search can reuse its cache.

The list and item detail hooks share the watchlist key. `useWatchlistItem`
uses `select` to pick one item from the existing list cache; it does not create
a second request.

## Search flow

The UI store holds the live input. `useDebouncedValue` waits before changing
the value used by the query.

`useSearchQuery` runs only when:

- the trimmed text has the minimum length, and
- movie search has a configured TMDB key when Movies is selected.

TanStack Query supplies an `AbortSignal` to the query function. Both API
clients pass it to `fetch`, so an obsolete request can be cancelled.

`isFetching` drives the searching message. A disabled query can still be in a
pending state, so `isPending` would show a spinner before the user typed.

## Mock watchlist backend

`src/features/watchlist/watchlistApi.ts` behaves like a small server:

- reads and writes are asynchronous,
- latency makes pending states visible,
- writes can be forced to fail,
- returned items are copied,
- duplicate adds and missing items reject.

The array is module memory. Reloading the app recreates it from
`seedWatchlist`. It is intentionally not saved to local storage.

## Optimistic removal flow

Suppose the current cache contains items A, B, and C, and the user removes B.

1. `onMutate` cancels watchlist reads already in flight.
2. It snapshots `[A, B, C]`.
3. It writes `[A, C]` to the cache immediately.
4. The screen rerenders before the mock server responds.
5. If the server rejects, `onError` restores `[A, B, C]`.
6. `onSettled` invalidates `['watchlist']` in either case.
7. The next read reconciles the cache with the server.

Cancellation matters because an older read could otherwise finish after step
3 and overwrite the prediction.

Add and update use the same lifecycle helper. The update prediction and the
mock backend both call `applyWatchlistUpdate`. That shared rule clears a rating
whenever status is not `done`, so client prediction and server result cannot
drift.

Turn on **Simulate server failure** to see rollback:

1. click Remove,
2. confirm the dialog,
3. watch the card disappear,
4. wait for it to return,
5. read the mutation error.

## Files removed from Stage 5

The Redux store, typed Redux hooks, root reducer, root saga, feature slices,
selectors, and saga tests are gone. Their packages are also absent from
`package.json` and the lockfile.

TanStack Query now supplies loading, error, retry, cancellation, caching, and
invalidation state. Zustand actions replace UI reducers. `useMemo` and query
`select` replace selectors where derivation is still useful.

## Run and verify

```bash
npm install
npm test
npx tsc -p tsconfig.app.json --noEmit
npm run build:lib
npm run build:app
npm run dev
```

In the browser, verify:

- the watchlist briefly loads,
- URL filters survive refresh,
- details and protected edit routes still work,
- theme survives reload but mock auth dies with the tab,
- book search is debounced,
- repeated searches reuse cache,
- the failure switch rolls back a remove,
- Query Devtools shows watchlist and search entries.

## Stage 7 transition

Stage 6 deliberately stops at state ownership and remote-data behavior.
Strings remain hard-coded in English, and components have not been optimized
or reorganized for performance. Stage 7 can add internationalization and
measured React improvements without changing the state split established here.
