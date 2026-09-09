import { screen } from '@testing-library/react';
import { renderWithProviders } from '../testing/renderWithProviders.js';
import { testI18n } from '../testing/testI18n.js';
import LanguageSwitcher from './LanguageSwitcher.js';

describe('LanguageSwitcher', () => {
  it('reports a failed language change and keeps the control usable', async () => {
    jest
      .spyOn(testI18n, 'changeLanguage')
      .mockRejectedValueOnce(new Error('locale chunk unavailable'));
    const { user } = renderWithProviders(<LanguageSwitcher />);

    await user.click(screen.getByRole('combobox', { name: 'Language' }));
    await user.click(screen.getByRole('option', { name: 'Español' }));

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent('Could not change language.');
    expect(screen.getByRole('combobox', { name: 'Language' })).toBeEnabled();
  });
});
