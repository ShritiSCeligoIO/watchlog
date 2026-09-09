import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { selectIsAuthenticated } from '../features/auth/authSelectors';
import { loggedIn } from '../features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

/** Provide a mock login and return visitors to the protected URL they requested. */
export default function LoginPage() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
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
    dispatch(loggedIn());
    navigate(destination, { replace: true, state: { filterQuery } });
  }

  return (
    <section className="rounded-xl border bg-card p-6 shadow-sm sm:max-w-md" aria-label="Sign in">
      <h2 className="text-xl font-semibold">Sign in</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        This mock sign-in keeps Stage 3 focused on protected routes.
      </p>
      <Button type="button" className="mt-4" onClick={handleLogin}>
        Sign in
      </Button>
    </section>
  );
}
