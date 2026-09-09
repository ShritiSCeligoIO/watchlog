import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { toErrorMessage } from '../api/isRetryableError.js';
import ItemEditForm from '../components/ItemEditForm';
import { Button } from '../components/ui/button';
import { useWatchlistItem } from '../features/watchlist/watchlistQueries';

export default function ItemEditPage() {
  const { t } = useTranslation(['watchlist', 'common']);
  const { itemId } = useParams();
  const { data: item, isPending, isError, error } = useWatchlistItem(itemId);

  if (isPending) {
    return (
      <section
        aria-label={t('watchlist:edit.label')}
        className="rounded-xl border bg-card p-6 shadow-sm"
      >
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {t('watchlist:detail.loading')}
        </p>
      </section>
    );
  }

  if (!item) {
    return (
      <section
        aria-label={t('watchlist:edit.label')}
        className="rounded-xl border bg-card p-6 shadow-sm"
      >
        <h2 className="text-xl font-semibold">
          {isError
            ? t('watchlist:detail.loadErrorTitle')
            : t('watchlist:detail.notFoundTitle')}
        </h2>
        {isError && (
          <p className="mt-2 text-sm text-muted-foreground">
            {toErrorMessage(error, t('watchlist:errors.retry'))}
          </p>
        )}
        <Button variant="secondary" className="mt-4" asChild>
          <Link to="/watchlist">{t('common:actions.back')}</Link>
        </Button>
      </section>
    );
  }

  return (
    <section
      aria-label={t('watchlist:edit.label')}
      className="rounded-xl border bg-card p-4 shadow-sm sm:p-6"
    >
      {/* Interpolation rather than `'Edit ' + item.title`, so a locale that puts
          the verb after the object can still do so. */}
      <h2 className="mb-6 text-xl font-semibold">
        {t('watchlist:edit.heading', { title: item.title })}
      </h2>
      <ItemEditForm item={item} />
    </section>
  );
}
