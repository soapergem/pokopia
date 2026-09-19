import type { Source } from "../types";

export type SourceFilterValue = "all" | Source;

interface Props {
  value: SourceFilterValue;
  onChange: (value: SourceFilterValue) => void;
  counts: Record<SourceFilterValue, number>;
}

const CHIPS: { value: SourceFilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "base", label: "Base Game" },
  { value: "dlc", label: "DLC" },
  { value: "event", label: "Event" },
];

export function SourceFilter({ value, onChange, counts }: Props) {
  return (
    <div className="chips" role="radiogroup" aria-label="Filter by release">
      {CHIPS.map((chip) => (
        <button
          key={chip.value}
          type="button"
          role="radio"
          aria-checked={value === chip.value}
          className={`chip ${value === chip.value ? "chip--active" : ""}`}
          onClick={() => onChange(chip.value)}
        >
          {chip.label}
          <span className="chip__count">{counts[chip.value]}</span>
        </button>
      ))}
    </div>
  );
}
