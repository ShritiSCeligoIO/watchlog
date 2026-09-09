import { afterEach, describe, expect, it, vi } from 'vitest';
import { applyTheme, systemTheme } from './theme.js';

describe('theme helpers', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('uses the operating-system color preference', () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn(() => ({ matches: true })),
    });

    expect(systemTheme()).toBe('dark');
  });

  it('applies the dark class to the document root', () => {
    const toggle = vi.fn();
    vi.stubGlobal('document', {
      documentElement: { classList: { toggle } },
    });

    applyTheme('dark');

    expect(toggle).toHaveBeenCalledWith('dark', true);
  });
});
