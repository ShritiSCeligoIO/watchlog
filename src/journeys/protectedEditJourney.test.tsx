import { screen } from '@testing-library/react';
import { renderApp } from '../testing/renderWithProviders.js';

describe('protected edit route', () => {
  it('returns a signed-out user to the requested page after sign-in', async () => {
    const { user } = renderApp({ route: '/items/book-2/edit' });

    expect(
      await screen.findByRole('heading', { name: 'Sign in' })
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByRole('heading', { name: 'Edit Dune' })
    ).toBeInTheDocument();
  });
});
