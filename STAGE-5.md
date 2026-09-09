# Stage 5 — Redux Toolkit and Redux Saga

## The gist

Stage 4 shared data through React Context and kept search state in a custom
hook. That works for a small app, but it spreads state changes across several
React-specific APIs.

Stage 5 gives shared application state one home:

- Redux Toolkit defines state and updates.
- React Redux connects components to the store.
- Redux Saga runs asynchronous work.
- Reselect computes filtered views and statistics.
- React Router still owns filter values in the URL.

The Stage 4 routes, styling, forms, dialogs, and theme behavior stay the same.
Only the shared data flow changes.

## The Redux mental model

Think of Redux as a small event-driven loop:

1. A component dispatches an action.
2. A reducer receives the action.
3. The reducer calculates the next state.
4. Selectors read the state.
5. Subscribed components render the new values.

An action is a plain description of something that happened:

```ts
dispatch(searchQueryChanged('dune'));
```

The search reducer stores that text:

```ts
searchQueryChanged(state, action) {
  state.query = action.payload;
}
```

Redux Toolkit uses Immer, so this direct-looking assignment still creates an
immutable state update.

## Store flow

`rootReducer.ts` combines three feature reducers:

```text
state.auth
state.search
state.watchlist
```

`store/index.ts` creates the store, adds saga middleware, enables Redux
DevTools, and starts the root saga.

Components use two typed hooks:

- `useAppSelector` reads values.
- `useAppDispatch` sends actions.

For example, the search panel reads the current query and dispatches an action
when the input changes. It does not call an API directly.

```text
input change
  -> searchQueryChanged
  -> search reducer updates query
  -> search saga notices the action
  -> API result action
  -> search reducer updates results
  -> SearchPanel renders results
```

That is the main Stage 5 pattern: component, action, reducer or saga, result
action, UI.

## Slices and reducers

A Redux Toolkit slice creates its state shape, reducers, and action creators
together. Auth stores the mock session, search stores its input and request
state, and watchlist handles add, remove, and update actions.

Reducers stay pure: they do not call browser APIs, make requests, navigate, or
start timers.

## Saga flow

A saga is a generator function that describes side effects as steps.

The root saga starts the auth watcher and search watcher. Watchers wait for
actions and start worker sagas.

The search watcher uses `takeLatest`. When query or media type changes, it
starts `runSearch`. If another relevant action arrives, the older task is
cancelled.

`runSearch` follows these readable steps:

1. Wait for the debounce period.
2. Read media type and query from Redux.
3. Clear results for a short query.
4. Skip unconfigured movie search.
5. Dispatch `searchStarted`.
6. Call the correct API client.
7. Dispatch success or failure.
8. Abort an active request if cancelled.

The saga owns timing and networking. The reducer only reacts to the saga's
actions.

## Debounce and cancellation

Debouncing waits briefly after typing before making a request. Typing
`d`, `du`, `dun`, and `dune` quickly should produce one useful search.

`takeLatest` cancels the older saga task. Cancellation alone does not guarantee
that `fetch` stops, so each search also creates an `AbortController`.

The controller's `signal` is passed to the API client. When the saga is
cancelled, its `finally` block calls `abort()`.

Together these prevent stale requests from replacing newer results and avoid
wasting network work.

## Retry and backoff

Some failures may disappear when tried again:

- a network interruption
- an HTTP 5xx server response

Those errors are marked `retryable` by the API clients. The saga retries them
at most twice after the first attempt, with a growing delay.

```text
first failure -> 300 ms wait
second failure -> 600 ms wait
third failure -> show error
```

Other errors are not retried:

- missing TMDB configuration
- invalid input
- HTTP 4xx client responses
- invalid response data
- deliberate request cancellation

Selective retry matters because repeating a bad API key or invalid request
cannot fix it. The backoff delay is also cancellable, so a new query does not
wait for an old retry loop.

## Auth side effect

The auth reducer only changes `isAuthenticated`. Its saga watches `loggedIn`
and `loggedOut`, then updates session storage. This keeps browser access out of
the reducer. It remains mock authentication, not production security.

## Selectors

Basic selectors read one value from the store. Reselect selectors derive a new
value from existing state and arguments.

The watchlist selectors derive:

- items matching the selected type and status
- statistics for those filtered items
- one item matching a route id

Reselect memoizes derived output while its inputs are unchanged.

The filter values themselves do not move to Redux. `useWatchlistFilters` still
reads and writes the URL query string.

That separation is intentional:

```text
URL: type and status filters
Redux: watchlist items
Selector: filtered items and filtered stats
```

A copied filtered URL therefore opens the same view.

## One search journey

Suppose a user searches books for `dune`.

1. `SearchPanel` dispatches `searchQueryChanged('dune')`.
2. The search reducer stores the query.
3. `watchSearch` starts `runSearch`.
4. The saga waits 300 milliseconds.
5. The saga reads `book` and `dune` from the store.
6. It dispatches `searchStarted`.
7. It calls `searchBooks` with an abort signal.
8. The client returns normalized book results.
9. The saga dispatches `searchSucceeded(results)`.
10. The reducer stores results and clears loading.
11. `SearchPanel` re-renders the result list.
12. Clicking Add dispatches the watchlist `addItem` action.

There is one obvious path from user event to state to UI.

## Tests

The saga tests focus on the behavior that is easiest to get wrong:

- successful search
- debounce and latest-request behavior
- aborting a cancelled request
- retrying transient failures
- not retrying permanent failures
- persisting mock-auth actions

Watchlist reducer tests cover add, remove, and update behavior.

API tests continue to cover validation, normalization, HTTP failures, and
`AbortSignal` forwarding.

## Commands

```bash
npm install
npm test
npx tsc -p tsconfig.app.json
npm run build:lib
npm run build:app
npm run dev
```

Book search works without a key. Movie search needs `TMDB_API_KEY` in `.env`.

## Moving to Stage 6

Stage 5 deliberately keeps server results in Redux and uses sagas for requests
so the action-to-saga-to-reducer flow is visible.

Stage 6 can introduce tools that separate server cache from client state. At
that point, compare what those tools automate against the explicit Stage 5
flow. Keep URL filters in the URL and avoid changing several state patterns at
once.
