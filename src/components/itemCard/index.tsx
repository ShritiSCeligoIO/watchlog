import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../i18n/format.js';
import { MEDIA_TYPE_LABEL_KEYS, STATUS_LABEL_KEYS } from '../../i18n/labelKeys.js';
import { cn } from '../../lib/utils';
import type { WatchlistItem } from '../../types/watchlistItem.js';
import { hasRating, isBookItem, isMovieItem } from '../../types/watchlistItem.js';
import { Badge } from '../ui/badge';
import { ItemCardProvider, useItemCardItem } from './itemCardContext.js';

const statusBorder = {
  want: 'border-l-status-want',
  watching: 'border-l-status-watching',
  done: 'border-l-status-done',
} as const;

interface RootProps {
  item: WatchlistItem;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}

function Root({ item, className, ariaLabel, children }: RootProps) {
  return (
    <ItemCardProvider value={item}>
      <article
        className={cn(
          'rounded-xl border border-l-4 bg-card p-4 shadow-sm',
          statusBorder[item.status],
          className
        )}
        data-testid={`watchlist-item-${item.id}`}
        aria-label={ariaLabel}
      >
        {children}
      </article>
    </ItemCardProvider>
  );
}

interface TitleProps {
  className?: string;
  children?: (title: string) => ReactNode;
}

function Title({ className, children }: TitleProps) {
  const item = useItemCardItem();
  return (
    <h2 className={cn('text-lg font-semibold leading-tight', className)}>
      {children ? children(item.title) : item.title}
    </h2>
  );
}

function Badges({ includeGenre = false }: { includeGenre?: boolean }) {
  const { t } = useTranslation('common');
  const item = useItemCardItem();
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant={item.type}>{t(MEDIA_TYPE_LABEL_KEYS[item.type])}</Badge>
      {includeGenre && <Badge variant="genre">{item.genre}</Badge>}
      <Badge variant={item.status}>{t(STATUS_LABEL_KEYS[item.status])}</Badge>
    </div>
  );
}

function Rating({ className }: { className?: string }) {
  const { t } = useTranslation('common');
  const item = useItemCardItem();
  if (item.status !== 'done' || !hasRating(item)) return null;
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>
      {t('rating.outOfFive', { rating: item.rating })}
    </p>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  );
}

function Details({ className }: { className?: string }) {
  const { t, i18n } = useTranslation(['watchlist', 'common']);
  const item = useItemCardItem();
  return (
    <dl className={cn('grid gap-4 sm:grid-cols-2', className)}>
      <DetailRow label={t('watchlist:detail.genre')} value={item.genre} />
      <DetailRow
        label={t('watchlist:detail.added')}
        value={formatDate(item.dateAdded, i18n.language)}
      />
      {item.status === 'done' && hasRating(item) && (
        <DetailRow
          label={t('watchlist:detail.rating')}
          value={t('common:rating.outOfFive', { rating: item.rating })}
        />
      )}
      {isMovieItem(item) && item.director && (
        <DetailRow label={t('watchlist:detail.director')} value={item.director} />
      )}
      {isMovieItem(item) && item.releaseYear && (
        <DetailRow label={t('watchlist:detail.year')} value={item.releaseYear} />
      )}
      {isBookItem(item) && item.author && (
        <DetailRow label={t('watchlist:detail.author')} value={item.author} />
      )}
      {isBookItem(item) && item.publishYear && (
        <DetailRow label={t('watchlist:detail.published')} value={item.publishYear} />
      )}
    </dl>
  );
}

function Actions({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-wrap gap-2', className)}>{children}</div>;
}

export const ItemCard = { Root, Title, Badges, Rating, Details, Actions };
