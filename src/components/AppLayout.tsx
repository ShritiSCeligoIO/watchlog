import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import LanguageSwitcher from './LanguageSwitcher';
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
  const { t } = useTranslation('common');
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const signOut = useAuthStore((state) => state.signOut);
  const cancelRemoval = useUiStore((state) => state.cancelRemoval);
  const { pathname } = useLocation();

  /**
   * A pending confirmation belongs to the view that asked for it. Without this,
   * opening the dialog on an item page and then navigating back would leave the
   * watchlist rendering an already-open dialog.
   */
  useEffect(() => {
    cancelRemoval();
  }, [pathname, cancelRemoval]);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-6 sm:px-6">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {/* The product name is deliberately in the translation files even
              though both locales spell it the same way. A name that is left
              hard-coded is a name nobody can localise later. */}
          <h1 className="text-3xl font-bold tracking-tight">{t('appName')}</h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            {t('tagline')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <nav
        className="mb-6 flex flex-wrap items-center gap-2 border-b border-border pb-4"
        aria-label={t('nav.label')}
      >
        <NavLink to="/watchlist" className={navLinkClass} end>
          {t('nav.watchlist')}
        </NavLink>
        {isAuthenticated ? (
          <Button type="button" variant="ghost" size="sm" onClick={signOut}>
            {t('nav.signOut')}
          </Button>
        ) : (
          <NavLink to="/login" className={navLinkClass}>
            {t('nav.signIn')}
          </NavLink>
        )}
      </nav>

      <Outlet />
    </main>
  );
}
