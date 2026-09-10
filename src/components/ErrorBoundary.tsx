import { Component, type ReactNode } from 'react';
import { i18next } from '../i18n/index.js';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

const FALLBACK_COPY = {
  title: 'WatchLog',
  message: 'Something went wrong. Refresh the page to try again.',
} as const;

function crashText(key: keyof typeof FALLBACK_COPY): string {
  if (!i18next.isInitialized) {
    return FALLBACK_COPY[key];
  }

  const translated = i18next.t(`errorBoundary.${key}`, {
    defaultValue: FALLBACK_COPY[key],
  });
  return typeof translated === 'string' && translated.length > 0
    ? translated
    : FALLBACK_COPY[key];
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
      return (
        <main className="mx-auto max-w-4xl px-4 py-6">
          <h1 className="text-3xl font-bold">
            {crashText('title')}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {crashText('message')}
          </p>
        </main>
      );
    }

    return this.props.children;
  }
}
