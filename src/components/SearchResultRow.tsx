import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { countRender } from '../dev/renderLog.js';
import type { MediaSearchResult } from '../features/search/searchTypes.js';
import { Button } from './ui/button';

interface SearchResultRowProps {
  result: MediaSearchResult;
  alreadyAdded: boolean;
  onAdd: (result: MediaSearchResult) => void;
}

const SearchResultRow = memo(function SearchResultRow({
  result,
  alreadyAdded,
  onAdd,
}: SearchResultRowProps) {
  countRender('SearchResultRow');
  const { t } = useTranslation('common');
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2">
      <span className="text-sm font-medium">{result.title}</span>
      {alreadyAdded ? (
        <span className="text-xs text-muted-foreground">{t('actions.added')}</span>
      ) : (
        <Button type="button" size="sm" onClick={() => onAdd(result)}>
          {t('actions.add')}
        </Button>
      )}
    </li>
  );
});

export default SearchResultRow;
