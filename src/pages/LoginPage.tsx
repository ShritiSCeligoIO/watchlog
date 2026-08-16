import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath =
    typeof location.state === 'object' &&
    location.state !== null &&
    'from' in location.state &&
    typeof location.state.from === 'string'
      ? location.state.from
      : '/watchlist';

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  function handleSignIn() {
    login();
    navigate(redirectPath, { replace: true });
  }

  return (
    <section
      aria-label="Sign in"
      className="rounded-xl border bg-card p-6 shadow-sm sm:max-w-md"
    >
      <h2 className="text-xl font-semibold">Sign in</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        WatchLog uses a mock sign-in for learning. Editing items requires auth.
      </p>
      <Button type="button" className="mt-4" onClick={handleSignIn}>
        Sign in
      </Button>
    </section>
  );
}
