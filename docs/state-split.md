# Stage 6 state ownership map

Ask: **where does the authoritative value live?**

If this app owns it, use Zustand. If an API owns it, use TanStack Query. If it
describes navigation, keep it in the URL.

## UI-owned: Zustand

| Field | Store | Persistence |
|---|---|---|
| Search text | `useUiStore` | none |
| Search media type | `useUiStore` | none |
| Theme | `useUiStore` | local storage |
| Item awaiting removal | `useUiStore` | none |
| Simulated failure switch | `useUiStore` | none |
| Mock signed-in flag | `useAuthStore` | session storage |

These values cannot become stale because this browser is their owner.

## API-owned: TanStack Query

| Data | Cache key |
|---|---|
| Watchlist | `['watchlist']` |
| Search results | `['search', mediaType, debouncedQuery]` |

These values can be loading, stale, cancelled, retried, or invalidated.

## Navigation-owned: URL

Type and status filters remain in `?type=&status=`. A filtered view can be
bookmarked, shared, refreshed, and navigated with Back or Forward. Mirroring
the same filters in Zustand would create two sources of truth.

## Persistence boundary

The UI and auth stores are separate because their persisted fields need
different lifetimes. Theme survives browser restarts; mock auth ends with the
tab. Search text, dialogs, and teaching controls always start clean.

The mock watchlist is never persisted. Its module-scoped array resets from the
seed fixture when the app reloads.
