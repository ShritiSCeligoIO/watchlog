// @vitest-environment jsdom
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { i18next, initI18n } from './index.js';

describe('i18n setup', () => {
  beforeAll(() => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
      clear: () => values.clear(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: storage,
      configurable: true,
    });
    vi.stubGlobal('localStorage', storage);
  });

  beforeEach(() => {
    window.localStorage.clear();
  });

  it('initializes once with bundled English', async () => {
    expect(initI18n()).toBe(initI18n());
    await initI18n();
    await i18next.changeLanguage('en');

    expect(i18next.t('nav.watchlist')).toBe('Watchlist');
    expect(document.documentElement.lang).toBe('en');
  });

  it('loads Spanish lazily and persists the choice', async () => {
    await initI18n();
    await i18next.changeLanguage('es');

    expect(i18next.t('nav.watchlist')).toBe('Mi lista');
    expect(document.documentElement.lang).toBe('es');
    expect(window.localStorage.getItem('watchlog:language')).toBe('es');
  });
});
