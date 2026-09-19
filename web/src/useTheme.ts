import { useCallback, useEffect, useState } from "react";

export type ThemePreference = "system" | "light" | "dark";

const STORAGE_KEY = "pokopia:theme:v1";

function isPreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

function read(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isPreference(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

/**
 * "system" leaves the document without a data-theme attribute so the
 * prefers-color-scheme rules in styles.css decide. The inline script in
 * index.html applies the stored value before first paint.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<ThemePreference>(read);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Preference just won't survive a reload.
    }
  }, [theme]);

  const setTheme = useCallback((next: ThemePreference) => setThemeState(next), []);

  return { theme, setTheme };
}
