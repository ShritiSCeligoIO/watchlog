import { Link } from 'react-router-dom';
import type { WatchlistItem } from '../types/watchlistItem.js';
import { hasRating } from '../types/watchlistItem.js';

interface WatchlistItemCardProps {
  item: WatchlistItem;
  filterQuery: string;
  onRemove: (id: string) => void;
}

/** Link each card to the item's shareable detail URL. */
export default function WatchlistItemCard({
  item,
  filterQuery,
  onRemove,
}: WatchlistItemCardProps) {
  return (
    <article
      className="card"
      data-testid={`watchlist-item-${item.id}`}
    >
      <h2>
        <Link
          to={`/items/${item.id}`}
          state={{ filterQuery }}
          className="card-title"
        >
          {item.title}
        </Link>
      </h2>

      <div className="badges">
        <span
          className={
            item.type === 'movie'
              ? 'badge movie'
              : 'badge book'
          }
        >
          {item.type === 'movie' ? 'Movie' : 'Book'}
        </span>
        <span className="badge">{item.genre}</span>
        <span className={`badge ${item.status}`}>
          {item.status}
        </span>
      </div>

      {item.status === 'done' && hasRating(item) && (
        <p className="rating">★ {item.rating} / 5</p>
      )}

      <div className="actions">
        <Link
          to={`/items/${item.id}`}
          state={{ filterQuery }}
          className="button small"
        >
          View
        </Link>
        <button
          type="button"
          className="button danger small"
          onClick={() => onRemove(item.id)}
        >
          Remove
        </button>
      </div>
    </article>
  );
}
