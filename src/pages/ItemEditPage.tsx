import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useWatchlistData } from '../context/WatchlistDataContext';
import type { StarRating, WatchlistItemUpdate, WatchStatus } from '../types/watchlistItem.js';

export default function ItemEditPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { getItemById, updateItem } = useWatchlistData();
  const item = itemId ? getItemById(itemId) : undefined;

  const [status, setStatus] = useState<WatchStatus>(item?.status ?? 'want');
  const [genre, setGenre] = useState(item?.genre ?? '');
  const [rating, setRating] = useState<StarRating | ''>(item?.rating ?? '');

  if (!item) {
    return (
      <section className="watchlog-panel" aria-label="Edit item">
        <h2>Item not found</h2>
        <Link to="/watchlist" className="watchlog-btn watchlog-btn--secondary">
          Back to watchlist
        </Link>
      </section>
    );
  }

  const watchlistItem = item;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const update: WatchlistItemUpdate = {
      status,
      genre: genre.trim() || watchlistItem.genre,
    };

    if (status === 'done') {
      update.rating = rating !== '' ? rating : null;
    }

    updateItem(watchlistItem.id, update);
    navigate(`/items/${watchlistItem.id}`);
  }

  return (
    <section className="watchlog-panel" aria-label="Edit item">
      <h2>Edit {watchlistItem.title}</h2>
      <form className="watchlog-form watchlog-edit-form" onSubmit={handleSubmit}>
        <label className="watchlog-filter-field">
          Status
          <select
            aria-label="Status"
            value={status}
            onChange={(event) => setStatus(event.target.value as WatchStatus)}
          >
            <option value="want">Want</option>
            <option value="watching">Watching / Reading</option>
            <option value="done">Done</option>
          </select>
        </label>

        <label className="watchlog-filter-field">
          Genre
          <input
            type="text"
            value={genre}
            onChange={(event) => setGenre(event.target.value)}
          />
        </label>

        {status === 'done' && (
          <label className="watchlog-filter-field">
            Rating
            <select
              aria-label="Rating"
              value={rating}
              onChange={(event) =>
                setRating(
                  event.target.value === ''
                    ? ''
                    : (Number(event.target.value) as StarRating)
                )
              }
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

        <div className="watchlog-detail-page__actions">
          <button type="submit" className="watchlog-btn watchlog-btn--primary">
            Save
          </button>
          <Link
            to={`/items/${watchlistItem.id}`}
            className="watchlog-btn watchlog-btn--secondary"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
