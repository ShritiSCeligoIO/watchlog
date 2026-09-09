/** Read retry classification from the error instead of parsing its message. */
function hasRetryableFlag(
  error: unknown
): error is Error & { retryable: boolean } {
  return (
    error instanceof Error &&
    typeof (error as { retryable?: unknown }).retryable === 'boolean'
  );
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

export function isRetryableError(error: unknown): boolean {
  // An abort is deliberate, never a transient fault.
  if (isAbortError(error)) {
    return false;
  }
  return hasRetryableFlag(error) && error.retryable;
}

export function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
