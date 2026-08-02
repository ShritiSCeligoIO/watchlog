import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AppLayout() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <main className="watchlog-app">
      <header className="watchlog-header">
        <h1>WatchLog</h1>
        <p>Track movies and books you want to watch, are watching, or have finished.</p>
      </header>

      <nav className="watchlog-nav" aria-label="Main">
        <NavLink
          to="/watchlist"
          className={({ isActive }) =>
            isActive ? 'watchlog-nav__link is-active' : 'watchlog-nav__link'
          }
          end
        >
          Watchlist
        </NavLink>
        {isAuthenticated ? (
          <button
            type="button"
            className="watchlog-nav__link watchlog-nav__link--button"
            onClick={logout}
          >
            Sign out
          </button>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              isActive ? 'watchlog-nav__link is-active' : 'watchlog-nav__link'
            }
          >
            Sign in
          </NavLink>
        )}
      </nav>

      <Outlet />
    </main>
  );
}
