import { Component, type ErrorInfo, type ReactNode } from 'react';

interface RemoteErrorBoundaryProps {
  children: ReactNode;
}

interface RemoteErrorBoundaryState {
  error: Error | null;
}

/** Contains remote download and render failures inside the shell. */
export default class RemoteErrorBoundary extends Component<
  RemoteErrorBoundaryProps,
  RemoteErrorBoundaryState
> {
  state: RemoteErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): RemoteErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(
      `logName=remoteLoadFailed, remote=watchlog, errorName=${error.name}`,
      { componentStack: errorInfo.componentStack }
    );
  }

  render(): ReactNode {
    const { error } = this.state;

    if (!error) {
      return this.props.children;
    }

    const remoteUrl = process.env.REMOTE_WATCHLOG_URL;

    return (
      <div className="host__error" role="alert">
        <h1 className="host__errorTitle">The WatchLog remote did not load</h1>

        <p>
          The host is running, but it could not fetch or start the remote from{' '}
          <code>{remoteUrl}</code>.
        </p>

        <p>
          The usual cause is that the remote is not running. Start it in a second
          terminal:
        </p>

        <pre className="host__code">npm run dev:remote</pre>

        <p className="host__errorDetail">
          Reported error: <code>{error.message}</code>
        </p>
      </div>
    );
  }
}
