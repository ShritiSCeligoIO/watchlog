import { lazy, Suspense } from 'react';
import RemoteErrorBoundary from './RemoteErrorBoundary';

const WatchLogApp = lazy(() => import('watchlog/WatchLogApp'));

export default function RemoteWatchLog() {
  return (
    <RemoteErrorBoundary>
      <Suspense
        fallback={
          <p className="host__status" role="status">
            Loading the WatchLog remote…
          </p>
        }
      >
        <WatchLogApp />
      </Suspense>
    </RemoteErrorBoundary>
  );
}
