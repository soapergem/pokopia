interface Props {
  value: string;
  onChange: (value: string) => void;
  count: number;
  isFiltered: boolean;
}

export function SearchBar({ value, onChange, count, isFiltered }: Props) {
  return (
    <div className="search">
      <svg className="search__icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <line x1="16.5" y1="16.5" x2="21" y2="21" />
      </svg>
      <input
        type="search"
        className="search__input"
        placeholder="Search by name or number…"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
        aria-label="Search Pokémon by name or number"
      />
      {value !== "" && (
        <button type="button" className="search__clear" onClick={() => onChange("")}>
          Clear
        </button>
      )}
      <span className="search__count" aria-live="polite">
        {isFiltered ? `${count} match${count === 1 ? "" : "es"}` : `${count} Pokémon`}
      </span>
    </div>
  );
}
