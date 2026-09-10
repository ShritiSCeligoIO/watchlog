interface ErrorLike {
  name: string;
  message: string;
}

function isErrorLike(error: unknown): error is ErrorLike {
  return (
    typeof error === 'object' &&
    error !== null &&
    typeof (error as { name?: unknown }).name === 'string' &&
    typeof (error as { message?: unknown }).message === 'string'
  );
}

/** Structural checks also work for errors created in another realm. */
function hasRetryableFlag(
  error: unknown
): error is ErrorLike & { retryable: boolean } {
  return (
    isErrorLike(error) &&
    typeof (error as { retryable?: unknown }).retryable === 'boolean'
  );
}

export function isAbortError(error: unknown): boolean {
  return isErrorLike(error) && error.name === 'AbortError';
}

export function isRetryableError(error: unknown): boolean {
  // An abort is deliberate, never a transient fault.
  if (isAbortError(error)) {
    return false;
  }
  return hasRetryableFlag(error) && error.retryable;
}

export function toErrorMessage(error: unknown, fallback: string): string {
  return isErrorLike(error) ? error.message : fallback;
}
