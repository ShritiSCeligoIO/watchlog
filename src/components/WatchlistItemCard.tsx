import { useState } from 'react';
import { Link, useMatch } from 'react-router-dom';
import type { WatchlistItem } from '../types/watchlistItem.js';
import { hasRating } from '../types/watchlistItem.js';
import { cn } from '../lib/utils';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import RemoveItemDialog from './RemoveItemDialog';
import { watchlistCardVariants } from './watchlistCardVariants';

interface WatchlistItemCardProps {
  item: WatchlistItem;
  filterQuery: string;
  onRemove: (id: string) => void;
}

export default function WatchlistItemCard({
  item,
  filterQuery,
  onRemove,
}: WatchlistItemCardProps) {
  const detailMatch = useMatch(`/items/${item.id}`);
  const isSelected = Boolean(detailMatch);
  const [removeOpen, setRemoveOpen] = useState(false);

  return (
    <>
      <article
        className={cn(
          watchlistCardVariants({ status: item.status, selected: isSelected })
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
          <p className="mb-3 text-sm text-muted-foreground">
            ★ {item.rating} / 5
          </p>
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
            onClick={() => setRemoveOpen(true)}
          >
            Remove
          </Button>
        </div>
      </article>

      <RemoveItemDialog
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        itemTitle={item.title}
        onConfirm={() => onRemove(item.id)}
      />
    </>
  );
}
