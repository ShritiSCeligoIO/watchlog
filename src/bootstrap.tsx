import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import WatchLogApp from './remote/WatchLogApp';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container element not found');
}

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      <Suspense fallback={null}>
        <BrowserRouter>
          <WatchLogApp />
        </BrowserRouter>
      </Suspense>
    </ErrorBoundary>
  </StrictMode>
);
