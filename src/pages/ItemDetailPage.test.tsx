import { act, screen, within } from '@testing-library/react';
import { useUiStore } from '../stores/uiStore.js';
import { renderApp } from '../testing/renderWithProviders.js';

describe('ItemDetailPage', () => {
  it('loads and renders an existing item', async () => {
    renderApp({ route: '/items/movie-1' });

    expect(screen.getByText('Loading item…')).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'Arrival' })
    ).toBeInTheDocument();
    expect(screen.getByText('Denis Villeneuve')).toBeInTheDocument();
    expect(screen.getByText('★ 5 / 5')).toBeInTheDocument();
  });

  it('explains when an item does not exist', async () => {
    renderApp({ route: '/items/missing-item' });

    expect(
      await screen.findByRole('heading', { name: 'Item not found' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No watchlist item matches/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Back to watchlist' })
    ).toHaveAttribute('href', '/watchlist');
  });

  it('removes an item and returns to the watchlist', async () => {
    const { user } = renderApp({ route: '/items/movie-1' });
    await screen.findByRole('heading', { name: 'Arrival' });

    await user.click(screen.getByRole('button', { name: 'Remove' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Remove' })
    );

    expect(
      await screen.findByRole('heading', { name: 'Your watchlist (4 items)' })
    ).toBeInTheDocument();
    expect(screen.queryByText('Arrival')).not.toBeInTheDocument();
  });

  it('restores an item when removal fails', async () => {
    const { user } = renderApp({ route: '/items/movie-1' });
    await screen.findByRole('heading', { name: 'Arrival' });
    act(() => useUiStore.getState().setSimulateWriteFailure(true));

    await user.click(screen.getByRole('button', { name: 'Remove' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Remove' })
    );

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent('server rejected the change');
    expect(screen.getByRole('heading', { name: 'Arrival' })).toBeInTheDocument();
  });
});
