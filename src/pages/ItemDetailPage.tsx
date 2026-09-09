import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useWatchlistData } from '../context/WatchlistDataContext';
import { hasRating, isBookItem, isMovieItem } from '../types/watchlistItem.js';

/** Read itemId from the URL instead of keeping a selected item in Context. */
export default function ItemDetailPage() {
  const { itemId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { getItemById, removeItem } = useWatchlistData();
  const item = itemId ? getItemById(itemId) : undefined;

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
      <section className="panel" aria-label="Item details">
        <h2>Item not found</h2>
        <p className="message">No watchlist item matches this URL.</p>
        <Link className="button" to={watchlistDestination}>
          Back to watchlist
        </Link>
      </section>
    );
  }

  const currentItemId = item.id;

  function handleRemove() {
    removeItem(currentItemId);
    navigate(watchlistDestination);
  }

  return (
    <section className="panel detail-page" aria-label="Item details">
      <h2>{item.title}</h2>
      <div className="badges">
        <span className={`badge ${item.type}`}>
          {item.type === 'movie' ? 'Movie' : 'Book'}
        </span>
        <span className={`badge ${item.status}`}>{item.status}</span>
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

      <div className="actions">
        <Link
          className="button primary"
          to={`/items/${item.id}/edit`}
          state={{ filterQuery }}
        >
          Edit
        </Link>
        <button type="button" className="button danger" onClick={handleRemove}>
          Remove
        </button>
        <Link className="button" to={watchlistDestination}>
          Back to watchlist
        </Link>
      </div>
    </section>
  );
}
