# WatchLog — Stage 9

Stage 9 adds a focused automated safety net.

The application still behaves like Stage 8.
The important change is confidence:
utilities, network hooks, pages, and one complete user journey now fail fast
when their contracts break.

## The gist

Vitest is replaced by Jest 29.
Component tests run in jsdom.
React Testing Library renders the UI.
`user-event` drives it like a user.
MSW 2 intercepts real Fetch API requests.
Istanbul coverage enforces four global 80% gates.

The suite contains 28 files and 77 tests.
That is intentionally smaller than the original Stage 9 suite.
Each layer has a distinct job instead of repeating the same assertion.

## Think of tests as a safety net

Small unit tests catch a broken rule close to its source.
Hook tests catch async state transitions.
Page tests catch components that no longer cooperate.
A journey catches navigation and wiring mistakes that isolated tests cannot see.
The layers overlap enough to catch gaps without duplicating every case.

## The test pyramid

The broad base is fast unit tests.

- Every Stage 1 public utility is covered.
- Type guards use realistic movie and book records.
- Search mappers verify optional fields and URL-safe IDs.
- API clients map realistic Open Library and TMDB payloads.
- Retry classification works with cross-realm errors.
- The fake watchlist backend covers create, update, delete, failure, and reset.

The middle is focused integration coverage.

- `useSearchQuery` covers loading, success, and API failure.
- `WatchlistPage` covers rendering, filtering, empty results, and rollback.
- Protected editing covers sign-in and redirect behavior.
- The error boundary covers initialized and uninitialized i18n.

The top is one complete journey.

- Search Open Library for The Hobbit.
- Add the result.
- Open its URL-safe detail route.
- Edit its status to Done.
- Rate it five stars.
- Save and verify the detail view.

## What each tool does

- Jest discovers tests, supplies assertions, and creates coverage.
- jsdom supplies a browser-like DOM, but it is not a complete browser.
- React Testing Library queries the accessible output users receive.
- `user-event` performs realistic click and typing event sequences.
- MSW handles real Request and Response objects at the network boundary.
- TanStack Query handles async state with a fresh client per test.

## Why MSW is not a fetch stub

A fetch stub often returns a convenient object:

```ts
{ ok: true, json: async () => payload }
```

That object is not a real Response.
It may hide a wrong URL, missing query parameter, invalid status, or broken
response parsing.

MSW matches the actual URL.
An unexpected request fails because `onUnhandledRequest` is set to `error`.
No test is allowed to fall through to the public internet.

Fixtures preserve leading Open Library slashes, missing optional fields,
numeric TMDB IDs, and numeric genre IDs.

## One MSW hook test

The hook test renders the hook inside Query, router, store, and i18n providers.
It delays the MSW response so loading is observable:

```ts
server.use(delayedHobbit());
const { result } = renderHookWithProviders(useSearchQuery);

enterBookQuery('hobbit');
await waitFor(() => expect(result.current.isSearching).toBe(true));
await waitFor(() =>
  expect(result.current.results[0]?.title).toBe('The Hobbit')
);
```

The success case uses the default handler.
The error case overrides it with an HTTP 500.
No case replaces `fetch`.

## One page integration flow

The page test starts with the seeded five-item watchlist.
It opens the real Radix type selector and chooses Books:

```ts
await user.click(
  screen.getByRole('combobox', { name: 'Filter list by type' })
);
await user.click(screen.getByRole('option', { name: 'Books' }));

await waitFor(() =>
  expect(screen.queryByText('Arrival')).not.toBeInTheDocument()
);
expect(screen.getByText('Project Hail Mary')).toBeInTheDocument();
```

Another case starts from URL filters that match nothing.
It verifies the localized empty message and filtered heading.

The rollback case enables the failure switch and confirms removal.
The card disappears optimistically, the fake server rejects the write,
and the item returns with an error message.

## The full journey

The journey renders the real App and routes.
It does not assemble a test-only copy of the screen.

The Open Library result ID is `works/OL82586W`.
The slash cannot remain in a route parameter.
The mapper converts it to `book-search-works-OL82586W`.

This was a real integration bug from the original Stage 9:
unit tests had asserted the old broken string and therefore approved it.
Clicking through the journey exposed that the route split into two segments.

The journey also verifies optimistic create and update behavior.
After Save, the detail page must show both Done and `★ 5 / 5`.

## Deterministic reset

Shared state makes tests order-dependent unless it is reset.

Every test gets:

- a new QueryClient with retries disabled;
- English test translations loaded synchronously;
- UI and auth stores restored to initial snapshots;
- localStorage and sessionStorage cleared;
- the fake watchlist restored to seed data;
- per-test MSW handler overrides removed.

The production App accepts an optional QueryClient.
Production still defaults to the shared client.
Tests inject an isolated client.

The fake backend keeps async promises but uses zero demo latency in test mode.
Tests that need visible loading add their own explicit MSW delay.

## Browser gaps in jsdom

Radix needs a few APIs jsdom does not implement.
The setup supplies minimal pointer-capture, scroll, resize, and match-media
stubs.

MSW 2 needs Node's Fetch API classes inside the jsdom realm.
The small custom environment copies only the required web globals.

It also patches jsdom's recursive `:modal` and `:fullscreen` selector path.
The patch returns false because jsdom implements neither browser top layer.

## Babel stays test-only

Jest compiles TypeScript and JSX to CommonJS with `babel-jest`.
Webpack production builds must retain ES modules for tree shaking.

The Webpack Babel rule sets `configFile: false`.
Therefore the root Jest Babel config cannot silently change production output.

## Type safety

`tsconfig.test.json` includes test files and helpers.
It keeps strict mode, `noUncheckedIndexedAccess`, and
`exactOptionalPropertyTypes`.

This catches fixtures that write `optionalField: undefined` when the real type
requires the field to be omitted.

## Coverage

Run:

```bash
npm run test:coverage -- --runInBand
```

Measured result:

- Statements: 95.02%
- Branches: 85.09%
- Functions: 94.88%
- Lines: 94.67%

All four global thresholds are 80%.
Dropping below any one makes the command exit non-zero.

Coverage excludes test infrastructure, fixtures, declarations, generated
entry/bootstrap boundaries, the remote mount boundary, and dev-only tooling.
Ordinary application logic remains included.

## Bugs the safety net caught

The work preserved several fixes learned in the original Stage 9:

- Open Library IDs are safe route segments.
- Abort errors are recognized structurally across realms.
- ErrorBoundary has useful copy before i18n initializes.
- fake backend state cannot leak between tests.
- test latency cannot cause flaky one-second waits.
- Webpack ignores the Jest-only Babel module transform.
- Radix dialogs keep their generated accessible description linkage.

## Commands

Use Node.js 22.11.0 and npm.

```bash
npm install
npm run install:host
npm test -- --runInBand
npm run typecheck:test
npm run typecheck
npm run typecheck:locales
npm run build:lib
npm run build:app
npm run build:host
npm run test:coverage -- --runInBand
```

For development:

```bash
npm run dev:mfe
```

The host runs at `http://localhost:3000`.
The standalone remote runs at `http://localhost:3001`.
