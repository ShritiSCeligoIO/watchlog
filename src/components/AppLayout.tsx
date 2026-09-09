import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'inline-flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    isActive
      ? 'bg-primary text-primary-foreground'
      : 'text-primary hover:bg-accent hover:text-accent-foreground'
  );

export default function AppLayout() {
  const { isAuthenticated, logout } = useAuth();

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
          <Button type="button" variant="ghost" size="sm" onClick={logout}>
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
