import { useMemo } from 'react';
import type { WatchlistItem } from '../types/watchlistItem.js';
import { statsSummary } from '../utils/statsSummary.js';

interface WatchlistStatsProps {
  /** Already filtered, so the figures always describe what is on screen. */
  items: WatchlistItem[];
}

/** Summarize the currently visible watchlist items. */
export default function WatchlistStats({ items }: WatchlistStatsProps) {
  const stats = useMemo(() => statsSummary(items), [items]);

  const completionPercent = Math.round(stats.completionRate * 100);
  const averageRating =
    stats.averageRating === null ? '—' : `★ ${stats.averageRating.toFixed(1)}`;

  return (
    <dl
      aria-label="Watchlist statistics"
      className="mb-6 grid gap-4 rounded-xl border bg-card p-4 shadow-sm sm:grid-cols-3 sm:p-6"
    >
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Items
        </dt>
        <dd className="mt-1 text-2xl font-semibold">{stats.totalCount}</dd>
      </div>
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Completed
        </dt>
        <dd className="mt-1 text-2xl font-semibold">{completionPercent}%</dd>
      </div>
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Average rating
        </dt>
        <dd className="mt-1 text-2xl font-semibold">{averageRating}</dd>
      </div>
    </dl>
  );
}
