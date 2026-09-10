import { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
  toSupportedLanguage,
} from '../i18n/languages.js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

/** Keep the current language interactive while a lazy locale loads. */
export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation('common');
  const [isSwitching, startSwitching] = useTransition();
  const [changeFailed, setChangeFailed] = useState(false);

  // `i18n.language` can carry a region tag such as `es-ES`, which would not
  // match any of the options below.
  const currentLanguage = toSupportedLanguage(i18n.language);

  function handleChange(value: string): void {
    const nextLanguage = toSupportedLanguage(value);

    if (nextLanguage === currentLanguage) {
      return;
    }

    setChangeFailed(false);
    startSwitching(async () => {
      try {
        await i18n.changeLanguage(nextLanguage);
      } catch {
        setChangeFailed(true);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentLanguage}
        onValueChange={handleChange}
        disabled={isSwitching}
      >
        <SelectTrigger
          id="language-switcher"
          className="w-[150px]"
          aria-label={t('language.label')}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_LANGUAGES.map((language) => (
            <SelectItem key={language} value={language}>
              {/* Each language is named in itself, so someone who cannot read
                  the current locale can still find their own. */}
              {LANGUAGE_LABELS[language]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isSwitching && (
        <span className="text-xs text-muted-foreground" aria-live="polite">
          {t('language.switching')}
        </span>
      )}
      {changeFailed && (
        <span className="text-xs text-destructive" role="alert">
          {t('language.failed')}
        </span>
      )}
    </div>
  );
}
