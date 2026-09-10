import { createContext, useContext } from 'react';
import type { WatchlistItem } from '../../types/watchlistItem.js';

/**
 * The item every `ItemCard` part renders from.
 *
 * This is what makes the compound API worth having. Without it each part would
 * need the item passed in — `<ItemCard.StatusBadge item={item} />` repeated on
 * every line — and the host would be threading the same object through six
 * children. The parts read it from the nearest `ItemCard` instead, so the host
 * only says *which parts* it wants and in what order.
 */
const ItemCardContext = createContext<WatchlistItem | null>(null);

export const ItemCardProvider = ItemCardContext.Provider;

/**
 * `null` is the "no provider above me" signal, which is a wiring mistake rather
 * than a state the UI should try to render. Throwing turns it into an
 * unmissable error at the point of the mistake, instead of a part that quietly
 * renders nothing.
 */
export function useItemCardItem(): WatchlistItem {
  const item = useContext(ItemCardContext);

  if (item === null) {
    throw new Error(
      'ItemCard parts must be rendered inside <ItemCard> or <ItemCard.Provider>.'
    );
  }

  return item;
}
