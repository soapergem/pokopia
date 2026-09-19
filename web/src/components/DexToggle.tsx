import type { DexMode } from "../pokedex";

interface Props {
  value: DexMode;
  onChange: (value: DexMode) => void;
}

const OPTIONS: { value: DexMode; label: string; title: string }[] = [
  { value: "pokopia", label: "Pokopia", title: "Number and order by the Pokopia dex" },
  { value: "national", label: "National", title: "Number and order by the National Pokédex" },
];

export function DexToggle({ value, onChange }: Props) {
  return (
    <div className="dex" role="radiogroup" aria-label="Dex numbering">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          title={option.title}
          className={`dex__option ${value === option.value ? "dex__option--active" : ""}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
