import { useTranslation } from 'react-i18next';
import { useUiStore } from '../stores/uiStore';
import { Button } from './ui/button';

export default function ThemeToggle() {
  const { t } = useTranslation('common');
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={t(theme === 'dark' ? 'theme.toLight' : 'theme.toDark')}
      onClick={toggleTheme}
    >
      <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
    </Button>
  );
}
