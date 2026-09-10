import { Trans, useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { toErrorMessage } from '../api/isRetryableError.js';
import RemoveItemDialog from '../components/RemoveItemDialog';
import { ItemCard } from '../components/itemCard/index';
import { Button } from '../components/ui/button';
import {
  useRemoveWatchlistItem,
  useWatchlistItem,
} from '../features/watchlist/watchlistQueries';
import { useUiStore } from '../stores/uiStore';

export default function ItemDetailPage() {
  const { t } = useTranslation(['watchlist', 'common']);
  const { itemId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: item, isPending, isError, error } = useWatchlistItem(itemId);

  const pendingRemoval = useUiStore((state) => state.pendingRemoval);
  const requestRemoval = useUiStore((state) => state.requestRemoval);
  const cancelRemoval = useUiStore((state) => state.cancelRemoval);
  const removeItem = useRemoveWatchlistItem();

  const backSearch =
    typeof location.state === 'object' &&
    location.state !== null &&
    'filterQuery' in location.state &&
    typeof location.state.filterQuery === 'string'
      ? location.state.filterQuery
      : '';

  const backTo = backSearch
    ? { pathname: '/watchlist', search: backSearch }
    : '/watchlist';

  /**
   * Three different reasons for having no item, which the synchronous stages
   * could collapse into one. The removal case matters most: the optimistic
   * write deletes the item from the cache before the server has answered, so
   * without this branch a successful removal would flash "not found".
   */
  if (!item) {
    if (isPending || removeItem.isPending) {
      return (
        <section
          aria-label={t('watchlist:detail.label')}
          className="rounded-xl border bg-card p-6 shadow-sm"
        >
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {removeItem.isPending
              ? t('watchlist:detail.removing')
              : t('watchlist:detail.loading')}
          </p>
        </section>
      );
    }

    return (
      <section
        aria-label={t('watchlist:detail.label')}
        className="rounded-xl border bg-card p-6 shadow-sm"
      >
        <h2 className="text-xl font-semibold">
          {isError
            ? t('watchlist:detail.loadErrorTitle')
            : t('watchlist:detail.notFoundTitle')}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {isError ? (
            toErrorMessage(error, t('watchlist:errors.retry'))
          ) : (
            <Trans
              i18nKey="detail.noMatch"
              ns="watchlist"
              values={{ itemId }}
              components={{ code: <code className="rounded bg-muted px-1" /> }}
            />
          )}
        </p>
        <Button variant="secondary" className="mt-4" asChild>
          <Link to={backTo}>{t('common:actions.back')}</Link>
        </Button>
      </section>
    );
  }

  const watchlistItem = item;

  function handleConfirmRemove() {
    // Navigating only once the write succeeds keeps the failure visible here
    // instead of on a page this component has already left.
    removeItem.mutate(watchlistItem.id, {
      onSuccess: () => navigate(backTo),
    });
  }

  return (
    <>
      <ItemCard.Root
        item={watchlistItem}
        ariaLabel={t('watchlist:detail.label')}
        className="p-4 sm:p-6"
      >
        <ItemCard.Title className="text-2xl font-bold" />
        <div className="mt-3">
          <ItemCard.Badges />
        </div>
        <ItemCard.Details className="mt-6" />

        {removeItem.isError && (
          <p className="mt-6 text-sm text-destructive" role="alert">
            {toErrorMessage(removeItem.error, t('watchlist:errors.remove'))}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild>
            <Link
              to={`/items/${watchlistItem.id}/edit`}
              state={{ filterQuery: backSearch }}
            >
              {t('common:actions.edit')}
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              requestRemoval({
                id: watchlistItem.id,
                title: watchlistItem.title,
              })
            }
          >
            {t('common:actions.remove')}
          </Button>
          <Button variant="secondary" asChild>
            <Link to={backTo}>{t('common:actions.back')}</Link>
          </Button>
        </div>
      </ItemCard.Root>

      <RemoveItemDialog
        open={pendingRemoval !== null}
        onOpenChange={(open) => {
          if (!open) {
            cancelRemoval();
          }
        }}
        itemTitle={pendingRemoval?.title ?? ''}
        onConfirm={handleConfirmRemove}
      />
    </>
  );
}
