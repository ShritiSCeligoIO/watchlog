import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import ThemeToggle from './ThemeToggle';
import { Button } from './ui/button';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'inline-flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    isActive
      ? 'bg-primary text-primary-foreground'
      : 'text-primary hover:bg-accent hover:text-accent-foreground'
  );

export default function AppLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const signOut = useAuthStore((state) => state.signOut);
  const cancelRemoval = useUiStore((state) => state.cancelRemoval);
  const { pathname } = useLocation();

  // A pending confirmation belongs to the route that opened it.
  useEffect(() => {
    cancelRemoval();
  }, [pathname, cancelRemoval]);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-6 sm:px-6">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WatchLog</h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Track movies and books you want to watch, are watching, or have finished.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <nav
        className="mb-6 flex flex-wrap items-center gap-2 border-b border-border pb-4"
        aria-label="Main"
      >
        <NavLink to="/watchlist" className={navLinkClass} end>
          Watchlist
        </NavLink>
        {isAuthenticated ? (
          <Button type="button" variant="ghost" size="sm" onClick={signOut}>
            Sign out
          </Button>
        ) : (
          <NavLink to="/login" className={navLinkClass}>
            Sign in
          </NavLink>
        )}
      </nav>

      <Outlet />
    </main>
  );
}
