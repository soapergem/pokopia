import type { ThemePreference } from "../useTheme";

interface Props {
  theme: ThemePreference;
  onChange: (theme: ThemePreference) => void;
}

const OPTIONS: { value: ThemePreference; label: string; icon: React.ReactNode }[] = [
  {
    value: "light",
    label: "Light",
    icon: (
      <>
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
      </>
    ),
  },
  {
    value: "system",
    label: "System",
    icon: (
      <>
        <rect x="2.5" y="4" width="19" height="13" rx="2" />
        <path d="M8.5 20.5h7" />
      </>
    ),
  },
  {
    value: "dark",
    label: "Dark",
    icon: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />,
  },
];

export function ThemeToggle({ theme, onChange }: Props) {
  return (
    <div className="theme" role="radiogroup" aria-label="Colour theme">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={theme === option.value}
          aria-label={`${option.label} theme`}
          title={`${option.label} theme`}
          className={`theme__option ${theme === option.value ? "theme__option--active" : ""}`}
          onClick={() => onChange(option.value)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">{option.icon}</svg>
        </button>
      ))}
    </div>
  );
}
