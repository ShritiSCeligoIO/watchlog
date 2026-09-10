import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toErrorMessage } from '../api/isRetryableError.js';
import RemoveItemDialog from '../components/RemoveItemDialog';
import SearchPanel from '../components/SearchPanel';
import ServerFailureToggle from '../components/ServerFailureToggle';
import WatchlistItemCard from '../components/WatchlistItemCard';
import WatchlistStats from '../components/WatchlistStats';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import type { StatusFilter, TypeFilter } from '../constants/watchlistFilters';
import { countRender } from '../dev/renderLog.js';
import {
  useRemoveWatchlistItem,
  useWatchlist,
} from '../features/watchlist/watchlistQueries';
import { useWatchlistFilters } from '../hooks/useWatchlistFilters';
import {
  MEDIA_TYPE_PLURAL_KEYS,
  STATUS_LABEL_KEYS,
} from '../i18n/labelKeys.js';
import { useUiStore } from '../stores/uiStore';
import { filterWatchlistItems } from '../utils/filterWatchlistItems.js';

export default function WatchlistPage() {
  countRender('WatchlistPage');
  const { t } = useTranslation(['watchlist', 'common']);

  // Filters stay in the URL so a filtered view remains shareable.
  const { typeFilter, statusFilter, setTypeFilter, setStatusFilter, filterQuery } =
    useWatchlistFilters();

  const { data: items = [], isPending, isError, error, isFetching, refetch } =
    useWatchlist();

  const filteredItems = useMemo(
    () => filterWatchlistItems(items, typeFilter, statusFilter),
    [items, typeFilter, statusFilter]
  );

  // Which item is awaiting confirmation is UI state; removing it is a mutation.
  const pendingRemoval = useUiStore((state) => state.pendingRemoval);
  const cancelRemoval = useUiStore((state) => state.cancelRemoval);
  const removeItem = useRemoveWatchlistItem();

  /**
   * The heading used to be assembled in JSX — `Your watchlist (` then a count
   * then a conditional ` of N` — which is the one thing translation cannot
   * reach. Even the brackets were ours to decide.
   *
   * The whole sentence is now a single key with real plural categories, so
   * English picks between "1 item" and "3 items" and Spanish is free to reorder
   * the words and repunctuate. Nothing below concatenates anything.
   */
  const isFiltered = filteredItems.length !== items.length;
  const heading = isFiltered
    ? t('watchlist:page.headingFiltered', {
        count: filteredItems.length,
        total: items.length,
      })
    : t('watchlist:page.heading', { count: filteredItems.length });

  return (
    <section aria-label={t('watchlist:page.label')}>
      <ServerFailureToggle />

      <SearchPanel />

      <WatchlistStats items={filteredItems} />

      <div className="mb-6 rounded-xl border bg-card p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-semibold">
          {t('watchlist:filters.heading')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="type-filter">{t('watchlist:filters.type')}</Label>
            <Select
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value as TypeFilter)}
            >
              <SelectTrigger
                id="type-filter"
                aria-label={t('watchlist:filters.byType')}
              >
                <SelectValue placeholder={t('watchlist:filters.allTypes')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t('watchlist:filters.allTypes')}
                </SelectItem>
                <SelectItem value="movie">
                  {t(`common:${MEDIA_TYPE_PLURAL_KEYS.movie}`)}
                </SelectItem>
                <SelectItem value="book">
                  {t(`common:${MEDIA_TYPE_PLURAL_KEYS.book}`)}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status-filter">
              {t('watchlist:filters.status')}
            </Label>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
              <SelectTrigger
                id="status-filter"
                aria-label={t('watchlist:filters.byStatus')}
              >
                <SelectValue placeholder={t('watchlist:filters.allStatuses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t('watchlist:filters.allStatuses')}
                </SelectItem>
                {/* The same keys the badges use, so a status can never be worded
                    one way in the filter and another way on the card. */}
                <SelectItem value="want">
                  {t(`common:${STATUS_LABEL_KEYS.want}`)}
                </SelectItem>
                <SelectItem value="watching">
                  {t(`common:${STATUS_LABEL_KEYS.watching}`)}
                </SelectItem>
                <SelectItem value="done">
                  {t(`common:${STATUS_LABEL_KEYS.done}`)}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-baseline gap-3">
        <h2 className="text-xl font-semibold">{heading}</h2>
        {/* Fetching while data is already on screen is the stale-while-revalidate
            refresh, which is why the list is not replaced by a loading state. */}
        {isFetching && !isPending && (
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {t('watchlist:page.refreshing')}
          </span>
        )}
      </div>

      {removeItem.isError && (
        <p className="mb-4 text-sm text-destructive" role="alert">
          {toErrorMessage(removeItem.error, t('watchlist:errors.remove'))}
        </p>
      )}

      {isPending ? (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {t('watchlist:page.loading')}
        </p>
      ) : isError ? (
        <div role="alert" className="space-y-3">
          <p className="text-sm text-destructive">
            {toErrorMessage(error, t('watchlist:errors.load'))}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
            {t('common:actions.tryAgain')}
          </Button>
        </div>
      ) : filteredItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t('watchlist:page.empty')}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredItems.map((item) => (
            <WatchlistItemCard key={item.id} item={item} filterQuery={filterQuery} />
          ))}
        </div>
      )}

      {filterQuery && (
        <p className="mt-4 text-sm text-muted-foreground">
          {t('watchlist:page.share')}{' '}
          <Link
            to={{ pathname: '/watchlist', search: filterQuery }}
            className="font-medium text-primary hover:underline"
          >
            /watchlist?{filterQuery}
          </Link>
        </p>
      )}

      {/* One dialog for the whole page, driven by the store rather than one
          instance per card. */}
      <RemoveItemDialog
        open={pendingRemoval !== null}
        onOpenChange={(open) => {
          if (!open) {
            cancelRemoval();
          }
        }}
        itemTitle={pendingRemoval?.title ?? ''}
        onConfirm={() => {
          if (pendingRemoval) {
            removeItem.mutate(pendingRemoval.id);
          }
        }}
      />
    </section>
  );
}
