import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { applyTheme } from './lib/theme';
import { useUiStore } from './stores/uiStore';
import './styles/globals.css';

// Apply the persisted theme before the first paint.
applyTheme(useUiStore.getState().theme);

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container element not found');
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
