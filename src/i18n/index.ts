import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';
import enAuth from './locales/en/auth.json';
import enCommon from './locales/en/common.json';
import enSearch from './locales/en/search.json';
import enWatchlist from './locales/en/watchlist.json';
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  toSupportedLanguage,
} from './languages.js';
import { DEFAULT_NAMESPACE, NAMESPACES } from './namespaces.js';

const LANGUAGE_STORAGE_KEY = 'watchlog:language';

const bundledEnglish = {
  common: enCommon,
  watchlist: enWatchlist,
  search: enSearch,
  auth: enAuth,
};

// Each entry becomes a lazy chunk. English is absent because it is bundled.
const lazyNamespaces: Record<string, () => Promise<unknown>> = {
  'es/common': () => import('./locales/es/common.json'),
  'es/watchlist': () => import('./locales/es/watchlist.json'),
  'es/search': () => import('./locales/es/search.json'),
  'es/auth': () => import('./locales/es/auth.json'),
};

function syncDocumentLanguage(language: string): void {
  document.documentElement.lang = toSupportedLanguage(language);
}

let initialisation: Promise<unknown> | null = null;

/** Initialize once so translations are ready before React renders. */
export function initI18n(): Promise<unknown> {
  if (initialisation !== null) return initialisation;

  i18next.on('languageChanged', syncDocumentLanguage);
  initialisation = i18next
    .use(LanguageDetector)
    .use(
      resourcesToBackend((language: string, namespace: string) => {
        const load = lazyNamespaces[`${language}/${namespace}`];
        if (load === undefined) {
          return Promise.reject(
            new Error(
              `logName=missingLazyTranslations, language=${language}, namespace=${namespace}`
            )
          );
        }
        return load();
      })
    )
    .use(initReactI18next)
    .init({
      resources: { en: bundledEnglish },
      partialBundledLanguages: true,
      fallbackLng: DEFAULT_LANGUAGE,
      supportedLngs: [...SUPPORTED_LANGUAGES],
      load: 'languageOnly',
      ns: [...NAMESPACES],
      defaultNS: DEFAULT_NAMESPACE,
      detection: {
        order: ['localStorage', 'navigator'],
        lookupLocalStorage: LANGUAGE_STORAGE_KEY,
        caches: ['localStorage'],
      },
      interpolation: { escapeValue: false },
    });

  return initialisation;
}

export { i18next };
