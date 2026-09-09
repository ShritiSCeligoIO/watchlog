import { isSupportedLanguage, toSupportedLanguage } from './languages.js';

describe('language helpers', () => {
  it('recognizes only shipped languages', () => {
    expect(isSupportedLanguage('es')).toBe(true);
    expect(isSupportedLanguage('fr')).toBe(false);
  });

  it('normalizes region tags and falls back to English', () => {
    expect(toSupportedLanguage('es-MX')).toBe('es');
    expect(toSupportedLanguage('fr')).toBe('en');
    expect(toSupportedLanguage(undefined)).toBe('en');
  });
});
