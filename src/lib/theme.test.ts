import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  applyTheme,
  persistTheme,
  readStoredTheme,
  resolveInitialTheme,
  THEME_STORAGE_KEY,
} from './theme';

function stubWindow(options: { stored?: string; prefersDark?: boolean } = {}) {
  const store = new Map<string, string>();
  if (options.stored !== undefined) {
    store.set(THEME_STORAGE_KEY, options.stored);
  }

  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    },
    matchMedia: () => ({ matches: Boolean(options.prefersDark) }),
  });

  return store;
}

function stubDocument() {
  const classes = new Set<string>();

  vi.stubGlobal('document', {
    documentElement: {
      classList: {
        toggle: (name: string, force: boolean) => {
          if (force) {
            classes.add(name);
          } else {
            classes.delete(name);
          }
        },
      },
    },
  });

  return classes;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('readStoredTheme', () => {
  it('returns the stored theme', () => {
    stubWindow({ stored: 'dark' });
    expect(readStoredTheme()).toBe('dark');
  });

  it('returns null when nothing is stored', () => {
    stubWindow();
    expect(readStoredTheme()).toBeNull();
  });

  it('returns null when the stored value is not a valid theme', () => {
    stubWindow({ stored: 'neon' });
    expect(readStoredTheme()).toBeNull();
  });
});

describe('resolveInitialTheme', () => {
  it('prefers an explicit stored choice over the system setting', () => {
    stubWindow({ stored: 'light', prefersDark: true });
    expect(resolveInitialTheme()).toBe('light');
  });

  it('falls back to the system setting when nothing is stored', () => {
    stubWindow({ prefersDark: true });
    expect(resolveInitialTheme()).toBe('dark');
  });

  it('defaults to light when the system does not prefer dark', () => {
    stubWindow({ prefersDark: false });
    expect(resolveInitialTheme()).toBe('light');
  });

  it('ignores an invalid stored value and uses the system setting', () => {
    stubWindow({ stored: 'neon', prefersDark: true });
    expect(resolveInitialTheme()).toBe('dark');
  });
});

describe('applyTheme', () => {
  it('adds the dark class for the dark theme', () => {
    const classes = stubDocument();
    applyTheme('dark');
    expect(classes.has('dark')).toBe(true);
  });

  it('removes the dark class for the light theme', () => {
    const classes = stubDocument();
    applyTheme('dark');
    applyTheme('light');
    expect(classes.has('dark')).toBe(false);
  });
});

describe('persistTheme', () => {
  it('writes the theme so the choice survives a reload', () => {
    const store = stubWindow();
    persistTheme('dark');
    expect(store.get(THEME_STORAGE_KEY)).toBe('dark');
  });
});
