import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    <section className="watchlog-panel" aria-label="Sign in">
      <h2>Sign in</h2>
      <p className="watchlog-hint">
        WatchLog uses a mock sign-in for learning. Editing items requires auth.
      </p>
      <button
        type="button"
        className="watchlog-btn watchlog-btn--primary"
        onClick={handleSignIn}
      >
        Sign in
      </button>
    </section>
  );
}
