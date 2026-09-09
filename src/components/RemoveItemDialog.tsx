import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import type { ReactElement } from 'react';

interface RemoveItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemTitle: string;
  onConfirm: () => void;
  trigger: ReactElement;
}

export default function RemoveItemDialog({
  open,
  onOpenChange,
  itemTitle,
  onConfirm,
  trigger,
}: RemoveItemDialogProps) {
  function handleConfirm() {
    onConfirm();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent aria-describedby="remove-item-description">
        <DialogHeader>
          <DialogTitle>Remove from watchlist?</DialogTitle>
          <DialogDescription id="remove-item-description">
            &ldquo;{itemTitle}&rdquo; will be removed. This cannot be undone until you
            search and add it again.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm}>
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
