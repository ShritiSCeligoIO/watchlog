import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { countRender } from '../dev/renderLog.js';
import { useUiStore } from '../stores/uiStore';
import type { WatchlistItem } from '../types/watchlistItem.js';
import { ItemCard } from './itemCard/index';
import { Button } from './ui/button';

interface WatchlistItemCardProps {
  item: WatchlistItem;
  filterQuery: string;
}

const WatchlistItemCard = memo(function WatchlistItemCard({
  item,
  filterQuery,
}: WatchlistItemCardProps) {
  countRender('WatchlistItemCard');
  const { t } = useTranslation('common');
  const requestRemoval = useUiStore((state) => state.requestRemoval);

  return (
    <ItemCard.Root item={item}>
      <ItemCard.Title className="mb-2">
        {(title) => (
          <Link
            to={`/items/${item.id}`}
            state={{ filterQuery }}
            className="text-foreground hover:text-primary hover:underline"
          >
            {title}
          </Link>
        )}
      </ItemCard.Title>
      <div className="mb-3">
        <ItemCard.Badges includeGenre />
      </div>
      <ItemCard.Rating className="mb-3" />
      <ItemCard.Actions>
        <Button variant="secondary" size="sm" asChild>
          <Link to={`/items/${item.id}`} state={{ filterQuery }}>
            {t('actions.view')}
          </Link>
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => requestRemoval({ id: item.id, title: item.title })}
        >
          {t('actions.remove')}
        </Button>
      </ItemCard.Actions>
    </ItemCard.Root>
  );
});

export default WatchlistItemCard;
