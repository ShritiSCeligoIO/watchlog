import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { applyTheme, resolveInitialTheme } from './lib/theme';
import './styles/globals.css';

// Apply the saved theme before React paints to avoid a light-mode flash.
applyTheme(resolveInitialTheme());
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('WatchLog needs an element with id="root"');
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
