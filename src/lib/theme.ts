export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'watchlog_theme';

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark';
}

/** Stored preference, or null when the user has never chosen a theme. */
export function readStoredTheme(): Theme | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isTheme(stored) ? stored : null;
}

/** Explicit user choice wins; otherwise follow the operating system setting. */
export function resolveInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return (
    readStoredTheme() ??
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function persistTheme(theme: Theme): void {
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}
