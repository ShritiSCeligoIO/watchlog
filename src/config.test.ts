import { describe, expect, it } from 'vitest';
import { validateMovieSearchConfig } from './config.js';

describe('validateMovieSearchConfig', () => {
  it('accepts a configured TMDB API key', () => {
    expect(() => validateMovieSearchConfig('test-key')).not.toThrow();
  });

  it('throws a structured error when the key is missing', () => {
    expect(() => validateMovieSearchConfig('')).toThrow(
      'logName=requiredEnvVarMissing, envVar=TMDB_API_KEY'
    );
  });
});
