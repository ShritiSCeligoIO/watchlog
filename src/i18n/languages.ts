/** Every locale the app ships. Adding one here is the first step to adding it. */
export const SUPPORTED_LANGUAGES = ['en', 'es'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

/**
 * Each language is named in itself rather than in the current UI language.
 * Someone who has landed in a locale they cannot read still needs to find
 * their own, so these deliberately live outside the translation files.
 */
export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Español',
};

/**
 * `i18n.language` is a plain string that can hold anything the detector found,
 * including a region tag such as `es-ES`. Narrowing it before use keeps the
 * switcher from selecting a value that is not one of its options.
 */
export function isSupportedLanguage(value: string): value is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

/** Falls back to the default rather than throwing, so a stale stored value cannot break boot. */
export function toSupportedLanguage(value: string | undefined): SupportedLanguage {
  if (value === undefined) {
    return DEFAULT_LANGUAGE;
  }

  const base = value.split('-')[0] ?? '';

  return isSupportedLanguage(value)
    ? value
    : isSupportedLanguage(base)
      ? base
      : DEFAULT_LANGUAGE;
}
