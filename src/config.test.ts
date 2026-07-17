import { afterEach, describe, expect, it, vi } from 'vitest';
import { config, validateMovieSearchConfig } from './config.js';

describe('validateMovieSearchConfig', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not exit when TMDB_API_KEY is configured', () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit called');
    }) as typeof process.exit);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() =>
      validateMovieSearchConfig({ tmdbApiKey: 'test-key' })
    ).not.toThrow();

    expect(exitSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('does not exit when config already has TMDB_API_KEY from the environment', () => {
    if (!config.tmdbApiKey) {
      return;
    }

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit called');
    }) as typeof process.exit);

    expect(() => validateMovieSearchConfig()).not.toThrow();
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('logs and exits when TMDB_API_KEY is missing', () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit called');
    }) as typeof process.exit);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => validateMovieSearchConfig({ tmdbApiKey: '' })).toThrow(
      'process.exit called'
    );

    expect(errorSpy).toHaveBeenCalledWith(
      'logName=requiredEnvVarMissing, envVar=TMDB_API_KEY'
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
