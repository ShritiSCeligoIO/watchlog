import { useSelection } from '../context/SelectionContext';
import { useWatchlistData } from '../context/WatchlistDataContext';
import { hasRating, isBookItem, isMovieItem } from '../types/watchlistItem.js';

/** Read both selection and item data from context instead of props. */
export default function ItemDetailPanel() {
  const { selectedId, clearSelection } = useSelection();
  const { getItemById, removeItem } = useWatchlistData();

  const item = selectedId ? getItemById(selectedId) : undefined;

  if (!item) {
    return (
      <aside
        className="detail-panel empty"
        aria-label="Item details"
      >
        <p>Select an item to see its details.</p>
      </aside>
    );
  }

  const itemId = item.id;

  function handleRemove() {
    clearSelection();
    removeItem(itemId);
  }

  return (
    <aside className="detail-panel" aria-label="Item details">
      <h2>{item.title}</h2>

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
        <span className={`badge ${item.status}`}>
          {item.status}
        </span>
      </div>

      <dl>
        <div className="detail-row">
          <dt>Genre</dt>
          <dd>{item.genre}</dd>
        </div>
        <div className="detail-row">
          <dt>Added</dt>
          <dd>{item.dateAdded}</dd>
        </div>
        {item.status === 'done' && hasRating(item) && (
          <div className="detail-row">
            <dt>Rating</dt>
            <dd>★ {item.rating} / 5</dd>
          </div>
        )}
        {isMovieItem(item) && item.director && (
          <div className="detail-row">
            <dt>Director</dt>
            <dd>{item.director}</dd>
          </div>
        )}
        {isMovieItem(item) && item.releaseYear && (
          <div className="detail-row">
            <dt>Year</dt>
            <dd>{item.releaseYear}</dd>
          </div>
        )}
        {isBookItem(item) && item.author && (
          <div className="detail-row">
            <dt>Author</dt>
            <dd>{item.author}</dd>
          </div>
        )}
        {isBookItem(item) && item.publishYear && (
          <div className="detail-row">
            <dt>Published</dt>
            <dd>{item.publishYear}</dd>
          </div>
        )}
      </dl>

      <button
        type="button"
        className="button danger"
        onClick={handleRemove}
      >
        Remove
      </button>
      <button
        type="button"
        className="button"
        onClick={clearSelection}
      >
        Close
      </button>
    </aside>
  );
}
