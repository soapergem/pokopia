import { useCallback, useEffect, useState } from "react";
import type { DexMode } from "./pokedex";

const STORAGE_KEY = "pokopia:dex:v1";

function isDexMode(value: unknown): value is DexMode {
  return value === "pokopia" || value === "national";
}

function read(): DexMode {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isDexMode(stored) ? stored : "pokopia";
  } catch {
    return "pokopia";
  }
}

/** Which numbering the list is labelled, ordered, and searched by. */
export function useDex() {
  const [dex, setDexState] = useState<DexMode>(read);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, dex);
    } catch {
      // Preference just won't survive a reload.
    }
  }, [dex]);

  const setDex = useCallback((next: DexMode) => setDexState(next), []);

  return { dex, setDex };
}
