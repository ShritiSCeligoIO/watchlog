import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { initI18n } from './i18n/index.js';
import { applyTheme } from './lib/theme';
import { useUiStore } from './stores/uiStore';
import './styles/globals.css';

applyTheme(useUiStore.getState().theme);

const container = document.getElementById('root');
if (!container) throw new Error('Root container element not found');
const root = createRoot(container);

function render(): void {
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <Suspense fallback={null}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Suspense>
      </ErrorBoundary>
    </StrictMode>
  );
}

initI18n().catch((error: unknown) => window.reportError(error)).finally(render);
