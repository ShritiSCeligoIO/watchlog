import { useTranslation } from 'react-i18next';
import { useUiStore } from '../stores/uiStore';
import { Label } from './ui/label';

/**
 * The demo control for optimistic rollback.
 *
 * With no real backend there is no natural way to make a write fail, and an
 * optimistic update that never has to revert proves nothing. This switch makes
 * the failure path reachable on demand.
 */
export default function ServerFailureToggle() {
  const { t } = useTranslation('common');
  const simulateWriteFailure = useUiStore((state) => state.simulateWriteFailure);
  const setSimulateWriteFailure = useUiStore(
    (state) => state.setSimulateWriteFailure
  );

  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-dashed border-border bg-card p-4">
      <input
        id="simulate-write-failure"
        type="checkbox"
        checked={simulateWriteFailure}
        onChange={(event) => setSimulateWriteFailure(event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-input accent-primary"
      />
      <div>
        <Label htmlFor="simulate-write-failure">{t('devControls.label')}</Label>
        <p className="mt-1 text-xs text-muted-foreground">
          {t('devControls.help')}
        </p>
      </div>
    </div>
  );
}
