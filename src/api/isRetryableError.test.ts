import {
  isAbortError,
  isRetryableError,
  toErrorMessage,
} from './isRetryableError.js';

describe('error classification', () => {
  const crossRealmAbort = {
    name: 'AbortError',
    message: 'This operation was aborted',
  };

  it('recognises structural AbortErrors across realms', () => {
    expect(isAbortError(new DOMException('Aborted', 'AbortError'))).toBe(true);
    expect(isAbortError(crossRealmAbort)).toBe(true);
    expect(isAbortError(new Error('ordinary'))).toBe(false);
  });

  it('retries only explicitly retryable non-abort errors', () => {
    expect(
      isRetryableError({ name: 'ApiError', message: '500', retryable: true })
    ).toBe(true);
    expect(
      isRetryableError({ name: 'ApiError', message: '404', retryable: false })
    ).toBe(false);
    expect(isRetryableError({ ...crossRealmAbort, retryable: true })).toBe(false);
    expect(isRetryableError('offline')).toBe(false);
  });

  it('extracts structural messages and otherwise uses the fallback', () => {
    expect(toErrorMessage(crossRealmAbort, 'fallback')).toBe(
      'This operation was aborted'
    );
    expect(toErrorMessage(null, 'fallback')).toBe('fallback');
    expect(toErrorMessage({ message: 5 }, 'fallback')).toBe('fallback');
  });
});
