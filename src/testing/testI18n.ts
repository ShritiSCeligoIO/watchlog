import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import enAuth from '../i18n/locales/en/auth.json';
import enCommon from '../i18n/locales/en/common.json';
import enSearch from '../i18n/locales/en/search.json';
import enWatchlist from '../i18n/locales/en/watchlist.json';

export const testI18n = i18next.createInstance();

void testI18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  ns: ['common', 'watchlist', 'search', 'auth'],
  defaultNS: 'common',
  resources: {
    en: {
      common: enCommon,
      watchlist: enWatchlist,
      search: enSearch,
      auth: enAuth,
    },
  },
  initAsync: false,
  interpolation: { escapeValue: false },
});
