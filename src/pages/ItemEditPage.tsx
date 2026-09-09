import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useWatchlistData } from '../context/WatchlistDataContext';
import type {
  StarRating,
  WatchlistItemUpdate,
  WatchStatus,
} from '../types/watchlistItem.js';

/** Edit the item named by the current URL parameter. */
export default function ItemEditPage() {
  const { itemId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { getItemById, updateItem } = useWatchlistData();
  const item = itemId ? getItemById(itemId) : undefined;
  const [status, setStatus] = useState<WatchStatus>(item?.status ?? 'want');
  const [genre, setGenre] = useState(item?.genre ?? '');
  const [rating, setRating] = useState<StarRating | ''>(item?.rating ?? '');

  const filterQuery =
    typeof location.state === 'object' &&
    location.state !== null &&
    'filterQuery' in location.state &&
    typeof location.state.filterQuery === 'string'
      ? location.state.filterQuery
      : '';

  if (!item) {
    return (
      <section className="panel" aria-label="Edit item">
        <h2>Item not found</h2>
        <Link className="button" to="/watchlist">
          Back to watchlist
        </Link>
      </section>
    );
  }

  const currentItemId = item.id;
  const currentGenre = item.genre;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const update: WatchlistItemUpdate = {
      status,
      genre: genre.trim() || currentGenre,
    };

    if (status === 'done') {
      update.rating = rating === '' ? null : rating;
    }

    updateItem(currentItemId, update);
    navigate(`/items/${currentItemId}`, { state: { filterQuery } });
  }

  return (
    <section className="panel" aria-label="Edit item">
      <h2>Edit {item.title}</h2>
      <form className="edit-form" onSubmit={handleSubmit}>
        <label className="filter-field">
          Status
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as WatchStatus)
            }
          >
            <option value="want">Want</option>
            <option value="watching">Watching / Reading</option>
            <option value="done">Done</option>
          </select>
        </label>

        <label className="filter-field">
          Genre
          <input
            value={genre}
            onChange={(event) => setGenre(event.target.value)}
          />
        </label>

        {status === 'done' && (
          <label className="filter-field">
            Rating
            <select
              value={rating}
              onChange={(event) => {
                const value = Number(event.target.value);
                setRating(
                  value >= 1 && value <= 5 ? (value as StarRating) : ''
                );
              }}
            >
              <option value="">No rating</option>
              <option value="1">★ 1</option>
              <option value="2">★ 2</option>
              <option value="3">★ 3</option>
              <option value="4">★ 4</option>
              <option value="5">★ 5</option>
            </select>
          </label>
        )}

        <div className="actions">
          <button type="submit" className="button primary">
            Save
          </button>
          <Link
            className="button"
            to={`/items/${item.id}`}
            state={{ filterQuery }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
