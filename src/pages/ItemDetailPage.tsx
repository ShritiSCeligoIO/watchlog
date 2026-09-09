import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import RemoveItemDialog from '../components/RemoveItemDialog';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useWatchlistData } from '../context/WatchlistDataContext';
import { hasRating, isBookItem, isMovieItem } from '../types/watchlistItem.js';

/** Read itemId from the URL instead of keeping a selected item in Context. */
export default function ItemDetailPage() {
  const { itemId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { getItemById, removeItem } = useWatchlistData();
  const item = itemId ? getItemById(itemId) : undefined;
  const [removeOpen, setRemoveOpen] = useState(false);

  // Router state is external input, so accept only the string field we expect.
  const filterQuery =
    typeof location.state === 'object' &&
    location.state !== null &&
    'filterQuery' in location.state &&
    typeof location.state.filterQuery === 'string'
      ? location.state.filterQuery
      : '';
  const watchlistDestination = filterQuery
    ? { pathname: '/watchlist', search: filterQuery }
    : '/watchlist';

  if (!item) {
    return (
      <section className="rounded-xl border bg-card p-6 shadow-sm" aria-label="Item details">
        <h2 className="text-xl font-semibold">Item not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">No watchlist item matches this URL.</p>
        <Button variant="secondary" className="mt-4" asChild>
          <Link to={watchlistDestination}>Back to watchlist</Link>
        </Button>
      </section>
    );
  }

  const currentItemId = item.id;

  function handleRemove() {
    removeItem(currentItemId);
    navigate(watchlistDestination);
  }

  return (
    <>
    <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-6" aria-label="Item details">
      <h2 className="text-2xl font-bold">{item.title}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant={item.type}>
          {item.type === 'movie' ? 'Movie' : 'Book'}
        </Badge>
        <Badge variant={item.status}>{item.status}</Badge>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Genre</dt>
          <dd className="mt-1 text-sm">{item.genre}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Added</dt>
          <dd className="mt-1 text-sm">{item.dateAdded}</dd>
        </div>
        {item.status === 'done' && hasRating(item) && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Rating</dt>
            <dd className="mt-1 text-sm">★ {item.rating} / 5</dd>
          </div>
        )}
        {isMovieItem(item) && item.director && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Director</dt>
            <dd className="mt-1 text-sm">{item.director}</dd>
          </div>
        )}
        {isMovieItem(item) && item.releaseYear && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Year</dt>
            <dd className="mt-1 text-sm">{item.releaseYear}</dd>
          </div>
        )}
        {isBookItem(item) && item.author && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Author</dt>
            <dd className="mt-1 text-sm">{item.author}</dd>
          </div>
        )}
        {isBookItem(item) && item.publishYear && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Published</dt>
            <dd className="mt-1 text-sm">{item.publishYear}</dd>
          </div>
        )}
      </dl>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild>
          <Link to={`/items/${item.id}/edit`} state={{ filterQuery }}>Edit</Link>
        </Button>
        <RemoveItemDialog
          open={removeOpen}
          onOpenChange={setRemoveOpen}
          itemTitle={item.title}
          onConfirm={handleRemove}
          trigger={
            <Button type="button" variant="destructive">
              Remove
            </Button>
          }
        />
        <Button variant="secondary" asChild>
          <Link to={watchlistDestination}>Back to watchlist</Link>
        </Button>
      </div>
    </section>
    </>
  );
}
