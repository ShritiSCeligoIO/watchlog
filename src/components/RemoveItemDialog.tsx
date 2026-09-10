import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface RemoveItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemTitle: string;
  onConfirm: () => void;
}

export default function RemoveItemDialog({
  open,
  onOpenChange,
  itemTitle,
  onConfirm,
}: RemoveItemDialogProps) {
  const { t } = useTranslation(['watchlist', 'common']);

  function handleConfirm() {
    onConfirm();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('watchlist:removeDialog.title')}</DialogTitle>
          <DialogDescription>
            {/* The quotation marks live in the translation, not the JSX. English
                uses “curly doubles” and Spanish uses «angle quotes», which is a
                punctuation rule the locale has to be free to change. */}
            {t('watchlist:removeDialog.description', { title: itemTitle })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common:actions.cancel')}
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm}>
            {t('common:actions.remove')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
