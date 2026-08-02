import { Link, useMatch } from 'react-router-dom';
import type { WatchlistItem } from '../types/watchlistItem.js';
import { hasRating } from '../types/watchlistItem.js';

interface WatchlistItemCardProps {
  item: WatchlistItem;
  filterQuery: string;
  onRemove: (id: string) => void;
}

export default function WatchlistItemCard({
  item,
  filterQuery,
  onRemove,
}: WatchlistItemCardProps) {
  const detailMatch = useMatch(`/items/${item.id}`);
  const isSelected = Boolean(detailMatch);

  return (
    <article
      className={isSelected ? 'watchlog-card is-selected' : 'watchlog-card'}
      data-testid={`watchlist-item-${item.id}`}
    >
      <div className="watchlog-card__top">
        <h2>
          <Link
            to={`/items/${item.id}`}
            state={{ filterQuery }}
            className="watchlog-card__title-link"
          >
            {item.title}
          </Link>
        </h2>
      </div>
      <div className="watchlog-card__meta">
        <span
          className={
            item.type === 'movie'
              ? 'watchlog-badge watchlog-badge--movie'
              : 'watchlog-badge watchlog-badge--book'
          }
        >
          {item.type === 'movie' ? 'Movie' : 'Book'}
        </span>
        <span className="watchlog-badge watchlog-badge--genre">{item.genre}</span>
        <span className={`watchlog-badge watchlog-badge--${item.status}`}>
          {item.status}
        </span>
      </div>
      {item.status === 'done' && hasRating(item) && (
        <p className="watchlog-card__rating">★ {item.rating} / 5</p>
      )}
      <div className="watchlog-card-actions">
        <Link
          to={`/items/${item.id}`}
          state={{ filterQuery }}
          className="watchlog-btn watchlog-btn--secondary watchlog-btn--sm"
        >
          View
        </Link>
        <button
          type="button"
          className="watchlog-btn watchlog-btn--danger watchlog-btn--sm"
          onClick={() => onRemove(item.id)}
        >
          Remove
        </button>
      </div>
    </article>
  );
}
