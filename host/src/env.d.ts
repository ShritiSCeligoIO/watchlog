declare module '*.css';

declare const process: {
  readonly env: {
    readonly REMOTE_WATCHLOG_URL?: string;
  };
};
