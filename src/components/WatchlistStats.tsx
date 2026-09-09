import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { countRender } from '../dev/renderLog.js';
import { formatDecimal, formatPercent } from '../i18n/format.js';
import type { WatchlistItem } from '../types/watchlistItem.js';
import { statsSummary } from '../utils/statsSummary.js';

interface WatchlistStatsProps {
  items: WatchlistItem[];
}

const WatchlistStats = memo(function WatchlistStats({
  items,
}: WatchlistStatsProps) {
  countRender('WatchlistStats');
  const { t, i18n } = useTranslation(['watchlist', 'common']);
  const stats = useMemo(() => statsSummary(items), [items]);
  const averageRating =
    stats.averageRating === null
      ? t('watchlist:stats.noValue')
      : t('common:rating.stars', {
          rating: formatDecimal(stats.averageRating, i18n.language),
        });

  return (
    <dl
      aria-label={t('watchlist:stats.label')}
      className="mb-6 grid gap-4 rounded-xl border bg-card p-4 shadow-sm sm:grid-cols-3 sm:p-6"
    >
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t('watchlist:stats.items')}
        </dt>
        <dd className="mt-1 text-2xl font-semibold">{stats.totalCount}</dd>
      </div>
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t('watchlist:stats.completed')}
        </dt>
        <dd className="mt-1 text-2xl font-semibold">
          {formatPercent(stats.completionRate, i18n.language)}
        </dd>
      </div>
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t('watchlist:stats.averageRating')}
        </dt>
        <dd className="mt-1 text-2xl font-semibold">{averageRating}</dd>
      </div>
    </dl>
  );
});

export default WatchlistStats;
