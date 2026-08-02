import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useWatchlistData } from '../context/WatchlistDataContext';
import { hasRating, isBookItem, isMovieItem } from '../types/watchlistItem.js';

export default function ItemDetailPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getItemById, removeItem } = useWatchlistData();
  const item = itemId ? getItemById(itemId) : undefined;

  const backSearch =
    typeof location.state === 'object' &&
    location.state !== null &&
    'filterQuery' in location.state &&
    typeof location.state.filterQuery === 'string'
      ? location.state.filterQuery
      : '';

  if (!item) {
    return (
      <section className="watchlog-panel" aria-label="Item details">
        <h2>Item not found</h2>
        <p className="watchlog-hint">
          No watchlist item matches <code>{itemId}</code>.
        </p>
        <Link
          to={backSearch ? { pathname: '/watchlist', search: backSearch } : '/watchlist'}
          className="watchlog-btn watchlog-btn--secondary"
        >
          Back to watchlist
        </Link>
      </section>
    );
  }

  const watchlistItem = item;

  function handleRemove() {
    removeItem(watchlistItem.id);
    navigate(backSearch ? { pathname: '/watchlist', search: backSearch } : '/watchlist');
  }

  return (
    <section className="watchlog-panel watchlog-detail-page" aria-label="Item details">
      <h2>{watchlistItem.title}</h2>
      <div className="watchlog-detail-panel__badges">
        <span
          className={
            watchlistItem.type === 'movie'
              ? 'watchlog-badge watchlog-badge--movie'
              : 'watchlog-badge watchlog-badge--book'
          }
        >
          {watchlistItem.type === 'movie' ? 'Movie' : 'Book'}
        </span>
        <span className={`watchlog-badge watchlog-badge--${watchlistItem.status}`}>
          {watchlistItem.status}
        </span>
      </div>
      <dl>
        <div className="watchlog-detail-row">
          <dt>Genre</dt>
          <dd>{watchlistItem.genre}</dd>
        </div>
        <div className="watchlog-detail-row">
          <dt>Added</dt>
          <dd>{watchlistItem.dateAdded}</dd>
        </div>
        {watchlistItem.status === 'done' && hasRating(watchlistItem) && (
          <div className="watchlog-detail-row">
            <dt>Rating</dt>
            <dd>★ {watchlistItem.rating} / 5</dd>
          </div>
        )}
        {isMovieItem(watchlistItem) && watchlistItem.director && (
          <div className="watchlog-detail-row">
            <dt>Director</dt>
            <dd>{watchlistItem.director}</dd>
          </div>
        )}
        {isMovieItem(watchlistItem) && watchlistItem.releaseYear && (
          <div className="watchlog-detail-row">
            <dt>Year</dt>
            <dd>{watchlistItem.releaseYear}</dd>
          </div>
        )}
        {isBookItem(watchlistItem) && watchlistItem.author && (
          <div className="watchlog-detail-row">
            <dt>Author</dt>
            <dd>{watchlistItem.author}</dd>
          </div>
        )}
        {isBookItem(watchlistItem) && watchlistItem.publishYear && (
          <div className="watchlog-detail-row">
            <dt>Published</dt>
            <dd>{watchlistItem.publishYear}</dd>
          </div>
        )}
      </dl>
      <div className="watchlog-detail-page__actions">
        <Link
          to={`/items/${watchlistItem.id}/edit`}
          state={{ filterQuery: backSearch }}
          className="watchlog-btn watchlog-btn--primary"
        >
          Edit
        </Link>
        <button
          type="button"
          className="watchlog-btn watchlog-btn--ghost"
          onClick={handleRemove}
        >
          Remove
        </button>
        <Link
          to={backSearch ? { pathname: '/watchlist', search: backSearch } : '/watchlist'}
          className="watchlog-btn watchlog-btn--secondary"
        >
          Back to watchlist
        </Link>
      </div>
    </section>
  );
}
