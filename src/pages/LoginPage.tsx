import { useTranslation } from 'react-i18next';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useAuthStore } from '../stores/authStore';

export default function LoginPage() {
  const { t } = useTranslation('auth');
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const signIn = useAuthStore((state) => state.signIn);
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
    signIn();
    navigate(redirectPath, { replace: true });
  }

  return (
    <section
      aria-label={t('label')}
      className="rounded-xl border bg-card p-6 shadow-sm sm:max-w-md"
    >
      <h2 className="text-xl font-semibold">{t('heading')}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t('description')}</p>
      <Button type="button" className="mt-4" onClick={handleSignIn}>
        {t('submit')}
      </Button>
    </section>
  );
}
