import { describe, expect, it } from 'vitest';
import { seedWatchlist } from '../../fixtures/seedWatchlist.js';
import reducer, { addItem, removeItem, updateItem } from './watchlistSlice';

const newBook = {
  id: 'book-new',
  type: 'book' as const,
  title: 'New Book',
  genre: 'Fiction',
  status: 'want' as const,
  dateAdded: '2026-09-09',
};

describe('watchlist reducer', () => {
  it('adds a new item once', () => {
    const added = reducer(undefined, addItem(newBook));
    const duplicate = reducer(added, addItem(newBook));

    expect(added.items).toHaveLength(seedWatchlist.length + 1);
    expect(duplicate.items).toEqual(added.items);
  });

  it('removes an item by id', () => {
    const state = reducer(undefined, removeItem(seedWatchlist[0]!.id));

    expect(state.items).not.toContainEqual(seedWatchlist[0]);
  });

  it('updates an item and enforces rating rules', () => {
    const id = seedWatchlist[0]!.id;
    const done = reducer(
      undefined,
      updateItem({ id, update: { status: 'done', rating: 5 } })
    );
    const reopened = reducer(
      done,
      updateItem({ id, update: { status: 'watching' } })
    );

    expect(done.items.find((item) => item.id === id)?.rating).toBe(5);
    expect(reopened.items.find((item) => item.id === id)?.rating).toBeUndefined();
  });
});
