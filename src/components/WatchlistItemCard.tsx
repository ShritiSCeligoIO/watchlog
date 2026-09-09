import { Link, useMatch } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useUiStore } from '../stores/uiStore';
import type { WatchlistItem } from '../types/watchlistItem.js';
import { hasRating } from '../types/watchlistItem.js';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const statusBorder = {
  want: 'border-l-status-want',
  watching: 'border-l-status-watching',
  done: 'border-l-status-done',
} as const;

interface WatchlistItemCardProps {
  item: WatchlistItem;
  /** Current URL filters, forwarded so Back restores the filtered view. */
  filterQuery: string;
}

/** Request removal; the page owns the dialog and mutation. */
export default function WatchlistItemCard({
  item,
  filterQuery,
}: WatchlistItemCardProps) {
  const detailMatch = useMatch(`/items/${item.id}`);
  const isSelected = Boolean(detailMatch);
  const requestRemoval = useUiStore((state) => state.requestRemoval);

  return (
    <article
      className={cn(
        'rounded-xl border border-l-4 bg-card p-4 shadow-sm transition-shadow hover:shadow-md',
        statusBorder[item.status],
        isSelected && 'ring-2 ring-ring'
      )}
      data-testid={`watchlist-item-${item.id}`}
    >
      <div className="mb-2">
        <h2 className="text-lg font-semibold leading-tight">
          <Link
            to={`/items/${item.id}`}
            state={{ filterQuery }}
            className="text-foreground hover:text-primary hover:underline"
          >
            {item.title}
          </Link>
        </h2>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <Badge variant={item.type === 'movie' ? 'movie' : 'book'}>
          {item.type === 'movie' ? 'Movie' : 'Book'}
        </Badge>
        <Badge variant="genre">{item.genre}</Badge>
        <Badge variant={item.status}>{item.status}</Badge>
      </div>

      {item.status === 'done' && hasRating(item) && (
        <p className="mb-3 text-sm text-muted-foreground">★ {item.rating} / 5</p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" asChild>
          <Link to={`/items/${item.id}`} state={{ filterQuery }}>
            View
          </Link>
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => requestRemoval({ id: item.id, title: item.title })}
        >
          Remove
        </Button>
      </div>
    </article>
  );
}
