import { Component, type ReactNode } from 'react';

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
      return (
        <main className="app">
          <h1>WatchLog</h1>
          <p>Something went wrong. Refresh the page to try again.</p>
        </main>
      );
    }

    return this.props.children;
  }
}
