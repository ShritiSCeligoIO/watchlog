import { Component, type ReactNode } from 'react';
import { i18next } from '../i18n/index.js';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    window.reportError(error);
  }

  render() {
    if (this.state.hasError) {
      /**
       * The one place that calls `i18next.t` directly instead of `useTranslation`.
       *
       * Partly because this is a class component and hooks are not available,
       * but mostly because this is the last thing standing between a crash and
       * a blank page — including a crash caused by i18n itself. The
       * `withTranslation` HOC would suspend while a locale loaded, and a
       * suspended error screen shows nothing at all.
       *
       * `defaultValue` is what makes that safe: if i18next never initialised,
       * `t` falls back to this English text rather than rendering the raw key.
       */
      return (
        <main className="mx-auto max-w-4xl px-4 py-6">
          <h1 className="text-3xl font-bold">
            {i18next.t('errorBoundary.title', { defaultValue: 'WatchLog' })}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {i18next.t('errorBoundary.message', {
              defaultValue:
                'Something went wrong. Refresh the page to try again.',
            })}
          </p>
        </main>
      );
    }

    return this.props.children;
  }
}
