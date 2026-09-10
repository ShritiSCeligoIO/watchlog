import { screen, waitFor, within } from '@testing-library/react';
import WatchlistPage from './WatchlistPage.js';
import { renderWithProviders } from '../testing/renderWithProviders.js';

describe('WatchlistPage', () => {
  it('renders the seeded watchlist and statistics', async () => {
    renderWithProviders(<WatchlistPage />);

    expect(await screen.findByText('Arrival')).toBeInTheDocument();
    expect(screen.getByText('Project Hail Mary')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Your watchlist (5 items)' })
    ).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('filters the rendered list through the Radix type selector', async () => {
    const { user } = renderWithProviders(<WatchlistPage />);
    await screen.findByText('Arrival');

    await user.click(
      screen.getByRole('combobox', { name: 'Filter list by type' })
    );
    await user.click(screen.getByRole('option', { name: 'Books' }));

    await waitFor(() =>
      expect(screen.queryByText('Arrival')).not.toBeInTheDocument()
    );
    expect(screen.getByText('Project Hail Mary')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Your watchlist (2 of 5 items)' })
    ).toBeInTheDocument();
  });

  it('renders the empty state when filters have no matches', async () => {
    renderWithProviders(<WatchlistPage />, {
      route: '/watchlist?type=book&status=done',
    });

    expect(
      await screen.findByText('No items match the current filters.')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Your watchlist (0 of 5 items)' })
    ).toBeInTheDocument();
  });

  it('rolls a failed removal back and reports the error', async () => {
    const { user } = renderWithProviders(<WatchlistPage />);
    await screen.findByText('Arrival');

    await user.click(
      screen.getByRole('checkbox', { name: 'Simulate server failure' })
    );
    await user.click(screen.getAllByRole('button', { name: 'Remove' })[0]!);
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Remove' })
    );

    expect(
      await screen.findByText(/server rejected the change/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Arrival')).toBeInTheDocument();
  });
});
