import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toErrorMessage } from '../api/isRetryableError.js';
import { useUpdateWatchlistItem } from '../features/watchlist/watchlistQueries';
import type {
  StarRating,
  WatchStatus,
  WatchlistItem,
  WatchlistItemUpdate,
} from '../types/watchlistItem.js';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

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

interface ItemEditFormProps {
  item: WatchlistItem;
}

/** Mount only after query data exists so form state uses real values. */
export default function ItemEditForm({ item }: ItemEditFormProps) {
  const navigate = useNavigate();
  const updateItem = useUpdateWatchlistItem();

  const [status, setStatus] = useState<WatchStatus>(item.status);
  const [genre, setGenre] = useState(item.genre);
  const [rating, setRating] = useState<StarRating | ''>(item.rating ?? '');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const update: WatchlistItemUpdate = {
      status,
      genre: genre.trim() || item.genre,
    };

    if (status === 'done') {
      update.rating = rating !== '' ? rating : null;
    }

    updateItem.mutate(
      { id: item.id, update },
      { onSuccess: () => navigate(`/items/${item.id}`) }
    );
  }

  return (
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
              <RadioGroupItem value={option.value} id={`status-${option.value}`} />
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

      {updateItem.isError && (
        <p className="text-sm text-destructive" role="alert">
          {toErrorMessage(updateItem.error, 'Could not save your changes.')}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={updateItem.isPending}>
          {updateItem.isPending ? 'Saving…' : 'Save'}
        </Button>
        <Button variant="secondary" asChild>
          <Link to={`/items/${item.id}`}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
