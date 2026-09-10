import { queryClient, RETRY_BACKOFF_MS } from './queryClient.js';

describe('production query defaults', () => {
  it('retries only transient reads within the retry limit', () => {
    const retry = queryClient.getDefaultOptions().queries?.retry;
    expect(typeof retry).toBe('function');
    const shouldRetry = retry as (count: number, error: unknown) => boolean;

    expect(
      shouldRetry(0, { name: 'ApiError', message: 'offline', retryable: true })
    ).toBe(true);
    expect(
      shouldRetry(0, { name: 'ApiError', message: 'bad input', retryable: false })
    ).toBe(false);
    expect(
      shouldRetry(2, { name: 'ApiError', message: 'offline', retryable: true })
    ).toBe(false);
  });

  it('backs off reads and never retries writes', () => {
    const retryDelay = queryClient.getDefaultOptions().queries?.retryDelay;
    expect((retryDelay as (attempt: number) => number)(2)).toBe(
      RETRY_BACKOFF_MS * 4
    );
    expect(queryClient.getDefaultOptions().mutations?.retry).toBe(0);
  });
});
