import { UNDO_WINDOW_MS, type PendingUndo } from "../useCaught";

interface Props {
  pending: PendingUndo | null;
  onUndo: () => void;
  onDismiss: () => void;
}

function describe({ caughtCount, releasedCount }: PendingUndo): string {
  const caught = `${caughtCount} marked caught`;
  const released = `${releasedCount} put back`;
  if (caughtCount > 0 && releasedCount > 0) return `${caught}, ${released}`;
  return caughtCount > 0 ? caught : released;
}

export function UndoPill({ pending, onUndo, onDismiss }: Props) {
  if (!pending) return null;

  return (
    // Keyed on the batch id so the countdown restarts whenever another tile is tapped.
    <div key={pending.id} className="undo" role="status" aria-live="polite">
      <span className="undo__label">{describe(pending)}</span>
      <button type="button" className="undo__action" onClick={onUndo}>
        Undo
      </button>
      <button type="button" className="undo__close" onClick={onDismiss} aria-label="Dismiss">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <span
        className="undo__timer"
        style={{ animationDuration: `${UNDO_WINDOW_MS}ms` }}
        aria-hidden="true"
      />
    </div>
  );
}
