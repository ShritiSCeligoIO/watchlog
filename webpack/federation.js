export const REMOTE_NAME = 'watchlog';
export const EXPOSED_APP = './WatchLogApp';
export const REMOTE_ENTRY_FILENAME = 'remoteEntry.js';
export const DEFAULT_REMOTE_URL = 'http://localhost:3001';

/** One runtime copy keeps React hooks and router context connected. */
export function sharedDependencies() {
  const singleton = (requiredVersion) => ({
    singleton: true,
    strictVersion: true,
    requiredVersion,
  });

  return {
    react: singleton('19.0.0'),
    'react-dom': singleton('19.0.0'),
    'react-dom/client': singleton('19.0.0'),
    'react-router-dom': singleton('6.28.0'),
  };
}
