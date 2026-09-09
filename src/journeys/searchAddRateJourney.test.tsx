import { screen, waitFor } from '@testing-library/react';
import { renderApp } from '../testing/renderWithProviders.js';

describe('search, add, update, and rate journey', () => {
  it('completes the journey through the real routes and fake backend', async () => {
    const { user } = renderApp({ signedIn: true });
    await screen.findByText('Arrival');

    await user.type(
      screen.getByRole('searchbox', { name: 'Search books' }),
      'hobbit'
    );
    expect(await screen.findByText('The Hobbit')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() =>
      expect(screen.getByText('Added')).toBeInTheDocument()
    );
    const itemLink = await screen.findByRole('link', { name: 'The Hobbit' });
    await user.click(itemLink);

    expect(
      await screen.findByRole('heading', { name: 'The Hobbit' })
    ).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Edit' }));

    expect(
      await screen.findByRole('heading', { name: 'Edit The Hobbit' })
    ).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Done' }));
    await user.click(screen.getByRole('radio', { name: '★ 5' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('★ 5 / 5')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });
});
