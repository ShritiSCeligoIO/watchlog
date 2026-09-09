import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { WatchlistItem } from '../../types/watchlistItem.js';
import { ItemCardProvider, useItemCardItem } from './itemCardContext.js';

const item: WatchlistItem = {
  id: 'book-test',
  type: 'book',
  title: 'Test Book',
  genre: 'Learning',
  status: 'want',
  dateAdded: '2026-01-10',
};

function Title() {
  return <span>{useItemCardItem().title}</span>;
}

describe('ItemCard context', () => {
  it('shares one item with compound parts', () => {
    const markup = renderToStaticMarkup(
      <ItemCardProvider value={item}>
        <Title />
      </ItemCardProvider>
    );
    expect(markup).toContain('Test Book');
  });

  it('fails clearly when a part is outside the root', () => {
    expect(() => renderToStaticMarkup(<Title />)).toThrow(
      'ItemCard parts must be rendered inside'
    );
  });
});
