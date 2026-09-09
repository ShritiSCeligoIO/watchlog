/**
 * Retry classification reads the `retryable` flag the API clients set at each
 * throw site. Parsing error messages would break the moment wording changes.
 */
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

export function isRetryableSearchError(error: unknown): boolean {
  // An abort is deliberate, never a transient fault.
  if (isAbortError(error)) {
    return false;
  }
  return hasRetryableFlag(error) && error.retryable;
}

export function toSearchErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Search failed';
}
