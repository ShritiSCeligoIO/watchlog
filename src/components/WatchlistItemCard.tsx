import { useSelection } from '../context/SelectionContext';
import { useWatchlistData } from '../context/WatchlistDataContext';
import type { WatchlistItem } from '../types/watchlistItem.js';
import { hasRating } from '../types/watchlistItem.js';

interface WatchlistItemCardProps {
  item: WatchlistItem;
}

/** Receive display data as a prop; read shared actions from context. */
export default function WatchlistItemCard({ item }: WatchlistItemCardProps) {
  const { selectedId, selectItem, clearSelection } = useSelection();
  const { removeItem } = useWatchlistData();

  const isSelected = selectedId === item.id;

  function handleRemove() {
    if (isSelected) {
      clearSelection();
    }
    removeItem(item.id);
  }

  return (
    <article
      className={isSelected ? 'card selected' : 'card'}
      data-testid={`watchlist-item-${item.id}`}
    >
      <h2>
        <button
          type="button"
          className="card-title"
          onClick={() => selectItem(item.id)}
        >
          {item.title}
        </button>
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
        <button
          type="button"
          className="button small"
          onClick={() => selectItem(item.id)}
        >
          View
        </button>
        <button
          type="button"
          className="button danger small"
          onClick={handleRemove}
        >
          Remove
        </button>
      </div>
    </article>
  );
}
