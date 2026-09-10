declare global {
  interface Window {
    __watchlogRenderLog?: Record<string, number>;
    __watchlogResetRenderLog?: () => void;
  }
}

/** Development-only render counts used by the reproducible performance audit. */
export function countRender(component: string): void {
  if (process.env.NODE_ENV !== 'development') return;

  const counts = (window.__watchlogRenderLog ??= {});
  counts[component] = (counts[component] ?? 0) + 1;
  window.__watchlogResetRenderLog = () => {
    window.__watchlogRenderLog = {};
  };
}
