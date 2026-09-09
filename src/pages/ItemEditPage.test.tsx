import { screen } from '@testing-library/react';
import { renderApp } from '../testing/renderWithProviders.js';

describe('ItemEditPage', () => {
  it('loads an existing item into the edit form', async () => {
    renderApp({ route: '/items/book-2/edit', signedIn: true });

    expect(screen.getByText('Loading item…')).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'Edit Dune' })
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Want' })).toBeChecked();
    expect(screen.getByRole('textbox', { name: 'Genre' })).toHaveValue(
      'Science Fiction'
    );
    expect(
      screen.queryByRole('radiogroup', { name: 'Rating' })
    ).not.toBeInTheDocument();
  });

  it('renders a useful missing-item state', async () => {
    renderApp({
      route: '/items/missing-item/edit',
      signedIn: true,
    });

    expect(
      await screen.findByRole('heading', { name: 'Item not found' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Back to watchlist' })
    ).toHaveAttribute('href', '/watchlist');
  });

  it('requires sign-in before showing the form', async () => {
    const { user } = renderApp({ route: '/items/book-2/edit' });

    expect(
      await screen.findByRole('heading', { name: 'Sign in' })
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByRole('heading', { name: 'Edit Dune' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });
});
