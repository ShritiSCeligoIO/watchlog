import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { toErrorMessage } from '../api/isRetryableError.js';
import { useUpdateWatchlistItem } from '../features/watchlist/watchlistQueries';
import { STATUS_LABEL_KEYS } from '../i18n/labelKeys.js';
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

/**
 * Values only. These arrays used to carry their own `label: 'Want'` strings,
 * which is why "Watching / Reading" existed twice in the codebase — once here
 * and once in the watchlist filters — and could be reworded in one place
 * without the other. The wording now comes from the shared status keys, so the
 * form and the filter cannot disagree.
 */
const STATUS_VALUES: readonly WatchStatus[] = ['want', 'watching', 'done'];

const RATING_VALUES: readonly (StarRating | 'none')[] = [
  'none',
  1,
  2,
  3,
  4,
  5,
];

interface ItemEditFormProps {
  item: WatchlistItem;
}

/**
 * Split out from the page so that it mounts only once the item has loaded.
 *
 * The earlier stages could seed `useState` straight from the item because the
 * data was already in memory. Now the first render happens before the fetch
 * resolves, and state initialisers run once — so a form mounted early would
 * hold the fallback values forever.
 */
export default function ItemEditForm({ item }: ItemEditFormProps) {
  const { t } = useTranslation(['watchlist', 'common']);
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

  function ratingLabel(value: StarRating | 'none'): string {
    return value === 'none'
      ? t('common:rating.none')
      : t('common:rating.stars', { rating: value });
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">
          {t('watchlist:edit.status')}
        </legend>
        <RadioGroup
          value={status}
          aria-label={t('watchlist:edit.status')}
          className="grid gap-3 sm:grid-cols-3"
          onValueChange={(value) => setStatus(value as WatchStatus)}
        >
          {STATUS_VALUES.map((value) => (
            <label
              key={value}
              htmlFor={`status-${value}`}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
            >
              <RadioGroupItem value={value} id={`status-${value}`} />
              {t(`common:${STATUS_LABEL_KEYS[value]}`)}
            </label>
          ))}
        </RadioGroup>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="genre">{t('watchlist:edit.genre')}</Label>
        <Input
          id="genre"
          type="text"
          value={genre}
          onChange={(event) => setGenre(event.target.value)}
        />
      </div>

      {status === 'done' && (
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">
            {t('watchlist:edit.rating')}
          </legend>
          <RadioGroup
            value={rating === '' ? 'none' : String(rating)}
            aria-label={t('watchlist:edit.rating')}
            className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6"
            onValueChange={(value) =>
              setRating(value === 'none' ? '' : (Number(value) as StarRating))
            }
          >
            {RATING_VALUES.map((value) => (
              <label
                key={String(value)}
                htmlFor={`rating-${value}`}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
              >
                <RadioGroupItem
                  value={String(value)}
                  id={`rating-${value}`}
                />
                {ratingLabel(value)}
              </label>
            ))}
          </RadioGroup>
        </fieldset>
      )}

      {updateItem.isError && (
        <p className="text-sm text-destructive" role="alert">
          {toErrorMessage(updateItem.error, t('watchlist:errors.save'))}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={updateItem.isPending}>
          {updateItem.isPending
            ? t('common:actions.saving')
            : t('common:actions.save')}
        </Button>
        <Button variant="secondary" asChild>
          <Link to={`/items/${item.id}`}>{t('common:actions.cancel')}</Link>
        </Button>
      </div>
    </form>
  );
}
