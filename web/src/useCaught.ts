import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "pokopia:caught:v1";

/** How long a batch stays undoable. Each new toggle restarts the window. */
export const UNDO_WINDOW_MS = 6000;

interface BatchEntry {
  slug: string;
  wasCaught: boolean;
}

interface Batch {
  /** Changes on every toggle so the countdown animation restarts. */
  id: number;
  entries: BatchEntry[];
}

export interface PendingUndo {
  id: number;
  /** Marked caught in this batch. */
  caughtCount: number;
  /** Unmarked in this batch. */
  releasedCount: number;
}

function read(): Set<string> {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return new Set();
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? new Set(parsed.filter((s) => typeof s === "string")) : new Set();
  } catch {
    // Private browsing, cleared site data, or blocked storage: start empty rather than crash.
    return new Set();
  }
}

export function useCaught() {
  const [caught, setCaught] = useState<Set<string>>(read);
  const [batch, setBatch] = useState<Batch | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const nextId = useRef(0);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...caught]));
    } catch {
      // Nothing to do: the checklist still works for this session.
    }
  }, [caught]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const stopTimer = useCallback(() => window.clearTimeout(timer.current), []);

  const restartTimer = useCallback(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setBatch(null), UNDO_WINDOW_MS);
  }, []);

  const toggle = useCallback(
    (slug: string) => {
      const wasCaught = caught.has(slug);

      setCaught((previous) => {
        const next = new Set(previous);
        if (wasCaught) next.delete(slug);
        else next.add(slug);
        return next;
      });

      setBatch((previous) => {
        const entries = previous ? [...previous.entries] : [];
        const index = entries.findIndex((entry) => entry.slug === slug);
        if (index === -1) {
          entries.push({ slug, wasCaught });
        } else {
          // Toggled back to where it started, so it is no longer a change to undo.
          entries.splice(index, 1);
        }
        if (entries.length === 0) return null;
        return { id: (nextId.current += 1), entries };
      });

      restartTimer();
    },
    [caught, restartTimer],
  );

  const undo = useCallback(() => {
    if (!batch) return;
    setCaught((current) => {
      const next = new Set(current);
      for (const entry of batch.entries) {
        if (entry.wasCaught) next.add(entry.slug);
        else next.delete(entry.slug);
      }
      return next;
    });
    setBatch(null);
    stopTimer();
  }, [batch, stopTimer]);

  const dismiss = useCallback(() => {
    setBatch(null);
    stopTimer();
  }, [stopTimer]);

  const reset = useCallback(() => {
    setCaught(new Set());
    setBatch(null);
    stopTimer();
  }, [stopTimer]);

  const pending: PendingUndo | null = batch && {
    id: batch.id,
    caughtCount: batch.entries.filter((entry) => !entry.wasCaught).length,
    releasedCount: batch.entries.filter((entry) => entry.wasCaught).length,
  };

  return { caught, toggle, reset, pending, undo, dismiss };
}
