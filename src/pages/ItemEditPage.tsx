import { Link, useParams } from 'react-router-dom';
import { toErrorMessage } from '../api/isRetryableError.js';
import ItemEditForm from '../components/ItemEditForm';
import { Button } from '../components/ui/button';
import { useWatchlistItem } from '../features/watchlist/watchlistQueries';

export default function ItemEditPage() {
  const { itemId } = useParams();
  const { data: item, isPending, isError, error } = useWatchlistItem(itemId);

  if (isPending) {
    return (
      <section
        aria-label="Edit item"
        className="rounded-xl border bg-card p-6 shadow-sm"
      >
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Loading item…
        </p>
      </section>
    );
  }

  if (!item) {
    return (
      <section
        aria-label="Edit item"
        className="rounded-xl border bg-card p-6 shadow-sm"
      >
        <h2 className="text-xl font-semibold">
          {isError ? 'Could not load this item' : 'Item not found'}
        </h2>
        {isError && (
          <p className="mt-2 text-sm text-muted-foreground">
            {toErrorMessage(error, 'Please try again.')}
          </p>
        )}
        <Button variant="secondary" className="mt-4" asChild>
          <Link to="/watchlist">Back to watchlist</Link>
        </Button>
      </section>
    );
  }

  return (
    <section
      aria-label="Edit item"
      className="rounded-xl border bg-card p-4 shadow-sm sm:p-6"
    >
      <h2 className="mb-6 text-xl font-semibold">Edit {item.title}</h2>
      <ItemEditForm item={item} />
    </section>
  );
}
