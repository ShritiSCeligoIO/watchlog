import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { initI18n } from '../i18n/index.js';
import ErrorBoundary from './ErrorBoundary.js';

function BrokenChild(): never {
  throw new Error('render failed');
}

function renderBoundary(child: ReactNode) {
  return render(<ErrorBoundary>{child}</ErrorBoundary>);
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    window.reportError = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('renders children while there is no error', () => {
    renderBoundary(<p>Healthy child</p>);
    expect(screen.getByText('Healthy child')).toBeInTheDocument();
  });

  it('uses hard-coded fallback copy before i18n initializes', () => {
    renderBoundary(<BrokenChild />);

    expect(screen.getByRole('heading', { name: 'WatchLog' })).toBeInTheDocument();
    expect(
      screen.getByText('Something went wrong. Refresh the page to try again.')
    ).toBeInTheDocument();
    expect(window.reportError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('uses translated fallback copy after i18n initializes', async () => {
    await initI18n();
    renderBoundary(<BrokenChild />);

    expect(screen.getByRole('heading', { name: 'WatchLog' })).toBeInTheDocument();
  });
});
