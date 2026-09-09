import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Provide a mock login and return visitors to the protected URL they requested. */
export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Validate navigation state because callers can supply arbitrary values.
  const destination =
    typeof location.state === 'object' &&
    location.state !== null &&
    'from' in location.state &&
    typeof location.state.from === 'string' &&
    location.state.from.startsWith('/') &&
    !location.state.from.startsWith('//')
      ? location.state.from
      : '/watchlist';
  const filterQuery =
    typeof location.state === 'object' &&
    location.state !== null &&
    'filterQuery' in location.state &&
    typeof location.state.filterQuery === 'string'
      ? location.state.filterQuery
      : '';

  if (isAuthenticated) {
    return (
      <Navigate
        to={destination}
        replace
        state={{ filterQuery }}
      />
    );
  }

  function handleLogin() {
    login();
    navigate(destination, { replace: true, state: { filterQuery } });
  }

  return (
    <section className="panel" aria-label="Sign in">
      <h2>Sign in</h2>
      <p className="message">
        This mock sign-in keeps Stage 3 focused on protected routes.
      </p>
      <button type="button" className="button primary" onClick={handleLogin}>
        Sign in
      </button>
    </section>
  );
}
