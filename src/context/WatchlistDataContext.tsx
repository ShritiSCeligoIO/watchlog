import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { seedWatchlist } from '../fixtures/seedWatchlist.js';
import {
  hasRating,
  type WatchlistItem,
  type WatchlistItemUpdate,
} from '../types/watchlistItem.js';

interface WatchlistDataContextValue {
  items: WatchlistItem[];
  addItem: (item: WatchlistItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, update: WatchlistItemUpdate) => void;
  getItemById: (id: string) => WatchlistItem | undefined;
}

const WatchlistDataContext = createContext<
  WatchlistDataContextValue | undefined
>(undefined);

export function WatchlistDataProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WatchlistItem[]>(seedWatchlist);

  const addItem = useCallback((item: WatchlistItem) => {
    setItems((prev) => {
      if (prev.some((existing) => existing.id === item.id)) {
        return prev;
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateItem = useCallback((id: string, update: WatchlistItemUpdate) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const { rating: ratingUpdate, ...restUpdate } = update;
        const merged: WatchlistItem = { ...item, ...restUpdate };

        if (ratingUpdate === null) {
          const { rating: _removed, ...withoutRating } = merged;
          return withoutRating as WatchlistItem;
        }

        if (ratingUpdate !== undefined) {
          merged.rating = ratingUpdate;
        }

        if (merged.status !== 'done' || !hasRating(merged)) {
          const { rating: _removed, ...withoutRating } = merged;
          return withoutRating as WatchlistItem;
        }

        return merged;
      })
    );
  }, []);

  const getItemById = useCallback(
    (id: string) => items.find((item) => item.id === id),
    [items]
  );

  const value = useMemo(
    () => ({ items, addItem, removeItem, updateItem, getItemById }),
    [items, addItem, removeItem, updateItem, getItemById]
  );

  return (
    <WatchlistDataContext.Provider value={value}>
      {children}
    </WatchlistDataContext.Provider>
  );
}

export function useWatchlistData(): WatchlistDataContextValue {
  const context = useContext(WatchlistDataContext);
  if (!context) {
    throw new Error('useWatchlistData must be used within WatchlistDataProvider');
  }
  return context;
}
