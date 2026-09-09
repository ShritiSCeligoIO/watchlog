import { afterEach, describe, expect, it, vi } from 'vitest';
import { applyTheme, persistTheme, resolveInitialTheme } from './theme.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('theme helpers', () => {
  it('uses a stored theme before the operating system preference', () => {
    vi.stubGlobal('window', {
      localStorage: { getItem: () => 'light' },
      matchMedia: () => ({ matches: true }),
    });

    expect(resolveInitialTheme()).toBe('light');
  });

  it('uses the operating system preference when nothing is stored', () => {
    vi.stubGlobal('window', {
      localStorage: { getItem: () => null },
      matchMedia: () => ({ matches: true }),
    });

    expect(resolveInitialTheme()).toBe('dark');
  });

  it('applies dark mode to the document root', () => {
    const toggle = vi.fn();
    vi.stubGlobal('document', {
      documentElement: { classList: { toggle } },
    });

    applyTheme('dark');

    expect(toggle).toHaveBeenCalledWith('dark', true);
  });

  it('persists an explicit theme choice', () => {
    const setItem = vi.fn();
    vi.stubGlobal('window', {
      localStorage: { setItem },
    });

    persistTheme('light');

    expect(setItem).toHaveBeenCalledWith('watchlog_theme', 'light');
  });
});
