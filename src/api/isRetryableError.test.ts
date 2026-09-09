import { describe, expect, it } from 'vitest';
import {
  isAbortError,
  isRetryableError,
  toErrorMessage,
} from './isRetryableError.js';

describe('query error helpers', () => {
  it('recognizes abort errors and never retries them', () => {
    const error = new DOMException('Stopped', 'AbortError');

    expect(isAbortError(error)).toBe(true);
    expect(isRetryableError(error)).toBe(false);
  });

  it('retries only errors carrying a true retryable flag', () => {
    const transient = Object.assign(new Error('Temporary'), {
      retryable: true,
    });

    expect(isRetryableError(transient)).toBe(true);
    expect(isRetryableError(new Error('Permanent'))).toBe(false);
  });

  it('uses error messages and a fallback for unknown values', () => {
    expect(toErrorMessage(new Error('Visible'), 'Fallback')).toBe('Visible');
    expect(toErrorMessage('unknown', 'Fallback')).toBe('Fallback');
  });
});
