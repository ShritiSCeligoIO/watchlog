import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useWatchlistData } from '../context/WatchlistDataContext';
import type { StarRating, WatchlistItemUpdate, WatchStatus } from '../types/watchlistItem.js';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';

const STATUS_OPTIONS: { value: WatchStatus; label: string }[] = [
  { value: 'want', label: 'Want' },
  { value: 'watching', label: 'Watching / Reading' },
  { value: 'done', label: 'Done' },
];

const RATING_OPTIONS: { value: StarRating | 'none'; label: string }[] = [
  { value: 'none', label: 'No rating' },
  { value: 1, label: '★ 1' },
  { value: 2, label: '★ 2' },
  { value: 3, label: '★ 3' },
  { value: 4, label: '★ 4' },
  { value: 5, label: '★ 5' },
];

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
      <section
        aria-label="Edit item"
        className="rounded-xl border bg-card p-6 shadow-sm"
      >
        <h2 className="text-xl font-semibold">Item not found</h2>
        <Button variant="secondary" className="mt-4" asChild>
          <Link to="/watchlist">Back to watchlist</Link>
        </Button>
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
    <section
      aria-label="Edit item"
      className="rounded-xl border bg-card p-4 shadow-sm sm:p-6"
    >
      <h2 className="mb-6 text-xl font-semibold">Edit {watchlistItem.title}</h2>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Status</legend>
          <RadioGroup
            value={status}
            aria-label="Status"
            className="grid gap-3 sm:grid-cols-3"
            onValueChange={(value) => setStatus(value as WatchStatus)}
          >
            {STATUS_OPTIONS.map((option) => (
              <label
                key={option.value}
                htmlFor={`status-${option.value}`}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
              >
                <RadioGroupItem
                  value={option.value}
                  id={`status-${option.value}`}
                />
                {option.label}
              </label>
            ))}
          </RadioGroup>
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="genre">Genre</Label>
          <Input
            id="genre"
            type="text"
            value={genre}
            onChange={(event) => setGenre(event.target.value)}
          />
        </div>

        {status === 'done' && (
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Rating</legend>
            <RadioGroup
              value={rating === '' ? 'none' : String(rating)}
              aria-label="Rating"
              className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6"
              onValueChange={(value) =>
                setRating(value === 'none' ? '' : (Number(value) as StarRating))
              }
            >
              {RATING_OPTIONS.map((option) => (
                <label
                  key={String(option.value)}
                  htmlFor={`rating-${option.value}`}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
                >
                  <RadioGroupItem
                    value={String(option.value)}
                    id={`rating-${option.value}`}
                  />
                  {option.label}
                </label>
              ))}
            </RadioGroup>
          </fieldset>
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="submit">Save</Button>
          <Button variant="secondary" asChild>
            <Link to={`/items/${watchlistItem.id}`}>Cancel</Link>
          </Button>
        </div>
      </form>
    </section>
  );
}
