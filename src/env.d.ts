declare module '*.css';

declare namespace NodeJS {
  interface ProcessEnv {
    readonly OPEN_LIBRARY_BASE_URL?: string;
    readonly TMDB_API_KEY?: string;
  }
}
