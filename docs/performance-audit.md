# Performance audit — simplified Stage 7

The simplified app was profiled before and after each retained optimization.
The evidence below was measured again on this implementation on 2026-09-09.

## Method

Development-only counters live in `src/dev/renderLog.ts`.
Measured components call `countRender('ComponentName')`.
Production builds remove the counter body through `import.meta.env.DEV`.

Run:

```bash
npm run dev
```

In the browser console:

```js
__watchlogResetRenderLog();
// perform one interaction
__watchlogRenderLog;
```

React `StrictMode` deliberately calls render twice in development.
These are render-function calls, not production commit counts.
The same mode was used before and after, so the comparison remains valid.

For each baseline, only the relevant `memo` wrappers were temporarily removed.
The component code, data, browser, input sequence, and counters were otherwise
identical. The wrappers were restored before the final checks.

## Interaction A: removal dialog

Setup: empty search, five visible cards, reset counters, open the first Remove
dialog, then press Cancel.

| Component | Before | After |
| --- | ---: | ---: |
| WatchlistPage | 4 | 4 |
| SearchPanel | 8 | 0 |
| WatchlistStats | 4 | 0 |
| WatchlistItemCard | 20 | 0 |
| **Total** | **36** | **4** |

That is an 89% reduction.

`WatchlistPage` owns the pending dialog state, so its four renders are useful.
The search panel, stats, and five cards displayed identical output.
Their stable props make `React.memo` appropriate.

The item objects retain identity through TanStack Query structural sharing.
The filtered array retains identity through the page's `useMemo`.
Without those stable values, memo would compare new references and fail.

## Interaction B: typing over results

Setup: search books for `dune`, wait for ten rows, reset counters, slowly type
four characters (`" mes"`), then wait one second for the debounced query and
deferred list to settle.

| Component | Before | After |
| --- | ---: | ---: |
| SearchPanel | 16 | 16 |
| SearchResultRow | 100 | 20 |
| **Total** | **116** | **36** |

That is a 69% reduction.

Before, ten unchanged rows rendered for every parent update.
After, `React.memo` skips those renders.
The remaining 20 calls are the ten rows rendering twice when the result set
actually changes under `StrictMode`.

`useCallback` keeps the row's `onAdd` prop stable.
`useMemo` avoids rebuilding the watchlist ID set on each keystroke.
Passing one `alreadyAdded` boolean avoids giving each row the whole set.

`useDeferredValue` does not reduce render count.
It lets React prioritize the controlled input while a result list is replaced.
The list is only ten rows today, so its visible benefit is small; it is retained
because the remote API limit can grow and the measured extra panel work is
outweighed by the skipped row work.

## Honest tradeoffs

- `memo` stores previous props and compares them. It is used only where repeated
  unchanged children were observed.
- `useMemo` is not used for trivial labels or JSX.
- `WatchlistPage` is not split merely to remove four cheap renders.
- `Intl` formatter instances are not cached; this panel is not a hot loop.
- Counters measure render frequency, not frame time or network speed.
- Development counts are intentionally higher than production because of
  `StrictMode`.

The useful result is not “all renders are bad.”
It is that renders with unchanged inputs were removed while necessary renders,
state ownership, and Stage 6 query behavior stayed intact.
