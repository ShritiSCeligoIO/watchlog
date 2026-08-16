import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useWatchlistData } from '../context/WatchlistDataContext';
import { hasRating, isBookItem, isMovieItem } from '../types/watchlistItem.js';
import RemoveItemDialog from '../components/RemoveItemDialog';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

export default function ItemDetailPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getItemById, removeItem } = useWatchlistData();
  const item = itemId ? getItemById(itemId) : undefined;
  const [removeOpen, setRemoveOpen] = useState(false);

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

  if (!item) {
    return (
      <section
        aria-label="Item details"
        className="rounded-xl border bg-card p-6 shadow-sm"
      >
        <h2 className="text-xl font-semibold">Item not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No watchlist item matches <code className="rounded bg-muted px-1">{itemId}</code>.
        </p>
        <Button variant="secondary" className="mt-4" asChild>
          <Link to={backTo}>Back to watchlist</Link>
        </Button>
      </section>
    );
  }

  const watchlistItem = item;

  function handleRemove() {
    removeItem(watchlistItem.id);
    navigate(backTo);
  }

  return (
    <>
      <section
        aria-label="Item details"
        className="rounded-xl border bg-card p-4 shadow-sm sm:p-6"
      >
        <h2 className="text-2xl font-bold">{watchlistItem.title}</h2>

        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant={watchlistItem.type === 'movie' ? 'movie' : 'book'}>
            {watchlistItem.type === 'movie' ? 'Movie' : 'Book'}
          </Badge>
          <Badge variant={watchlistItem.status}>{watchlistItem.status}</Badge>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Genre
            </dt>
            <dd className="mt-1 text-sm">{watchlistItem.genre}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Added
            </dt>
            <dd className="mt-1 text-sm">{watchlistItem.dateAdded}</dd>
          </div>
          {watchlistItem.status === 'done' && hasRating(watchlistItem) && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Rating
              </dt>
              <dd className="mt-1 text-sm">★ {watchlistItem.rating} / 5</dd>
            </div>
          )}
          {isMovieItem(watchlistItem) && watchlistItem.director && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Director
              </dt>
              <dd className="mt-1 text-sm">{watchlistItem.director}</dd>
            </div>
          )}
          {isMovieItem(watchlistItem) && watchlistItem.releaseYear && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Year
              </dt>
              <dd className="mt-1 text-sm">{watchlistItem.releaseYear}</dd>
            </div>
          )}
          {isBookItem(watchlistItem) && watchlistItem.author && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Author
              </dt>
              <dd className="mt-1 text-sm">{watchlistItem.author}</dd>
            </div>
          )}
          {isBookItem(watchlistItem) && watchlistItem.publishYear && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Published
              </dt>
              <dd className="mt-1 text-sm">{watchlistItem.publishYear}</dd>
            </div>
          )}
        </dl>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild>
            <Link
              to={`/items/${watchlistItem.id}/edit`}
              state={{ filterQuery: backSearch }}
            >
              Edit
            </Link>
          </Button>
          <Button type="button" variant="ghost" onClick={() => setRemoveOpen(true)}>
            Remove
          </Button>
          <Button variant="secondary" asChild>
            <Link to={backTo}>Back to watchlist</Link>
          </Button>
        </div>
      </section>

      <RemoveItemDialog
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        itemTitle={watchlistItem.title}
        onConfirm={handleRemove}
      />
    </>
  );
}
