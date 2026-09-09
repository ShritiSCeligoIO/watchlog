import { useUiStore } from '../stores/uiStore';
import { Label } from './ui/label';

/** Make the optimistic rollback path reachable on demand. */
export default function ServerFailureToggle() {
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
        <Label htmlFor="simulate-write-failure">Simulate server failure</Label>
        <p className="mt-1 text-xs text-muted-foreground">
          Makes every watchlist write reject. Add, edit, or remove an item to see
          the change apply instantly and then roll back.
        </p>
      </div>
    </div>
  );
}
