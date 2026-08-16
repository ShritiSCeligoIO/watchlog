import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { warnIfMovieSearchUnavailable } from './config.js';
import { applyTheme, resolveInitialTheme } from './lib/theme';
import './styles/globals.css';

// Runs before the first paint so the page never flashes the wrong theme.
applyTheme(resolveInitialTheme());
warnIfMovieSearchUnavailable();

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
