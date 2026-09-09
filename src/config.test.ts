import {
  isMovieSearchConfigured,
  validateMovieSearchConfig,
} from './config.js';

describe('validateMovieSearchConfig', () => {
  it('accepts a configured TMDB API key', () => {
    expect(() => validateMovieSearchConfig('test-key')).not.toThrow();
    expect(() => validateMovieSearchConfig()).not.toThrow();
    expect(isMovieSearchConfigured()).toBe(true);
  });

  it('throws a structured error when the key is missing', () => {
    expect(() => validateMovieSearchConfig('')).toThrow(
      'logName=requiredEnvVarMissing, envVar=TMDB_API_KEY'
    );
  });
});
