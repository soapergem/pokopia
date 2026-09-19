import { useEffect, useRef, useState } from "react";
import { DexToggle } from "./DexToggle";
import { ThemeToggle } from "./ThemeToggle";
import type { DexMode } from "../pokedex";
import type { ThemePreference } from "../useTheme";

interface Props {
  dex: DexMode;
  onDexChange: (dex: DexMode) => void;
  theme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
  canReset: boolean;
  onReset: () => void;
}

export function MobileMenu({ dex, onDexChange, theme, onThemeChange, canReset, onReset }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        trigger.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="menu" ref={container}>
      <button
        type="button"
        ref={trigger}
        className={`menu__trigger ${isOpen ? "menu__trigger--open" : ""}`}
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="masthead-menu"
        aria-label="Settings"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {isOpen && (
        <div className="menu__panel" id="masthead-menu" role="group" aria-label="Settings">
          <div className="menu__row">
            <span className="menu__label">Numbering</span>
            <DexToggle value={dex} onChange={onDexChange} />
          </div>

          <div className="menu__row">
            <span className="menu__label">Theme</span>
            <ThemeToggle theme={theme} onChange={onThemeChange} />
          </div>

          {canReset && (
            <button
              type="button"
              className="menu__reset"
              onClick={() => {
                setIsOpen(false);
                onReset();
              }}
            >
              Reset caught list
            </button>
          )}
        </div>
      )}
    </div>
  );
}
