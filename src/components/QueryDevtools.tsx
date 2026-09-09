import { lazy, Suspense } from 'react';

/**
 * Dynamically imported so the panel lands in its own chunk that a production
 * page never requests.
 */
const LazyDevtools = lazy(async () => {
  const devtools = await import('@tanstack/react-query-devtools');
  return { default: devtools.ReactQueryDevtools };
});

/** Renders the query cache inspector in development only. */
export default function QueryDevtools() {
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <LazyDevtools initialIsOpen={false} />
    </Suspense>
  );
}
