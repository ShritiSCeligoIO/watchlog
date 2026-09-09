import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Render the shared page frame around each nested route. */
export default function AppLayout() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <main className="app">
      <header className="app-header">
        <h1>WatchLog</h1>
        <p>
          Track movies and books you want to watch, are watching, or have
          finished.
        </p>
      </header>

      <nav className="nav" aria-label="Main navigation">
        <NavLink
          to="/watchlist"
          className={({ isActive }) => (isActive ? 'active' : undefined)}
        >
          Watchlist
        </NavLink>
        {isAuthenticated ? (
          <button type="button" className="link-button" onClick={logout}>
            Sign out
          </button>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            Sign in
          </NavLink>
        )}
      </nav>

      <Outlet />
    </main>
  );
}
