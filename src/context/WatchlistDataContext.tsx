import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { seedWatchlist } from '../fixtures/seedWatchlist.js';
import type { WatchlistItem } from '../types/watchlistItem.js';

interface WatchlistDataContextValue {
  items: WatchlistItem[];
  addItem: (item: WatchlistItem) => void;
  removeItem: (id: string) => void;
  getItemById: (id: string) => WatchlistItem | undefined;
}

const WatchlistDataContext = createContext<
  WatchlistDataContextValue | undefined
>(undefined);

/** Share one watchlist without passing it through every component. */
export function WatchlistDataProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WatchlistItem[]>(seedWatchlist);

  function addItem(item: WatchlistItem) {
    setItems((currentItems) => {
      if (currentItems.some((existing) => existing.id === item.id)) {
        return currentItems;
      }
      return [...currentItems, item];
    });
  }

  function removeItem(id: string) {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== id)
    );
  }

  function getItemById(id: string) {
    return items.find((item) => item.id === id);
  }

  return (
    <WatchlistDataContext.Provider
      value={{ items, addItem, removeItem, getItemById }}
    >
      {children}
    </WatchlistDataContext.Provider>
  );
}

export function useWatchlistData(): WatchlistDataContextValue {
  const context = useContext(WatchlistDataContext);
  if (!context) {
    throw new Error(
      'useWatchlistData must be used within WatchlistDataProvider'
    );
  }
  return context;
}
