import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { selectItemById } from '../features/watchlist/watchlistSelectors';
import { updateItem } from '../features/watchlist/watchlistSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import type {
  StarRating,
  WatchlistItemUpdate,
  WatchStatus,
} from '../types/watchlistItem.js';

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

/** Edit the item named by the current URL parameter. */
export default function ItemEditPage() {
  const { itemId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const item = useAppSelector((state) => selectItemById(state, itemId));
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
      <section className="rounded-xl border bg-card p-6 shadow-sm" aria-label="Edit item">
        <h2 className="text-xl font-semibold">Item not found</h2>
        <Button variant="secondary" className="mt-4" asChild>
          <Link to="/watchlist">Back to watchlist</Link>
        </Button>
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

    dispatch(updateItem({ id: currentItemId, update }));
    navigate(`/items/${currentItemId}`, { state: { filterQuery } });
  }

  return (
    <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-6" aria-label="Edit item">
      <h2 className="mb-6 text-xl font-semibold">Edit {item.title}</h2>
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
              <Label
                key={option.value}
                htmlFor={`status-${option.value}`}
                className="flex cursor-pointer items-center gap-2 rounded-lg border bg-background px-3 py-2"
              >
                <RadioGroupItem id={`status-${option.value}`} value={option.value} />
                {option.label}
              </Label>
            ))}
          </RadioGroup>
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="genre">Genre</Label>
          <Input
            id="genre"
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
                <Label
                  key={String(option.value)}
                  htmlFor={`rating-${option.value}`}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border bg-background px-3 py-2"
                >
                  <RadioGroupItem id={`rating-${option.value}`} value={String(option.value)} />
                  {option.label}
                </Label>
              ))}
            </RadioGroup>
          </fieldset>
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="submit">Save</Button>
          <Button variant="secondary" asChild>
            <Link to={`/items/${item.id}`} state={{ filterQuery }}>Cancel</Link>
          </Button>
        </div>
      </form>
    </section>
  );
}
