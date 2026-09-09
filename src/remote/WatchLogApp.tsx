import { use } from 'react';
import App from '@/App';
import ErrorBoundary from '@/components/ErrorBoundary';
import { initI18n } from '@/i18n/index.js';
import { applyTheme } from '@/lib/theme';
import { useUiStore } from '@/stores/uiStore';
import '@/styles/globals.css';

applyTheme(useUiStore.getState().theme);
const i18nReady = initI18n();

/** The remote owns app services and styles, but never a root or router. */
export default function WatchLogApp() {
  use(i18nReady);

  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
