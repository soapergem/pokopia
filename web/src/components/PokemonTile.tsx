import { dexLabel, type DexMode } from "../pokedex";
import type { Pokemon } from "../types";

interface Props {
  pokemon: Pokemon;
  dex: DexMode;
  isCaught: boolean;
  onToggle: (slug: string) => void;
}

const OBTAIN_LABELS: Record<string, string> = {
  story: "Story",
  quest: "Request",
  craft: "Crafted",
  event: "Event",
  "dream-island": "Dream Island",
};

export function PokemonTile({ pokemon, dex, isCaught, onToggle }: Props) {
  const label = dexLabel(pokemon, dex);
  const obtain = pokemon.obtainMethod ? OBTAIN_LABELS[pokemon.obtainMethod] : undefined;

  return (
    <button
      type="button"
      className={`tile ${isCaught ? "tile--caught" : ""}`}
      onClick={() => onToggle(pokemon.slug)}
      aria-pressed={isCaught}
      aria-label={`${pokemon.name}, ${label}. ${isCaught ? "Caught" : "Not caught"}.`}
    >
      <span className="tile__check" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <polyline points="5 12.5 10 17.5 19 7" />
        </svg>
      </span>

      <div className="tile__head">
        <img className="tile__art" src={pokemon.imageUrl} alt="" loading="lazy" decoding="async" />
        <div className="tile__identity">
          <span className="tile__number">{label}</span>
          <span className="tile__name">{pokemon.name}</span>
          <span className="tile__types">
            {pokemon.types.map((type) => (
              <span key={type} className={`type type--${type}`}>
                {type}
              </span>
            ))}
          </span>
        </div>
      </div>

      <div className="tile__habitats">
        {pokemon.habitats.length > 0 ? (
          <>
            <span className="tile__habitats-label">Habitats</span>
            <ul className="habitats">
              {pokemon.habitats.map((habitat) => (
                <li key={habitat.id} className={`habitat habitat--${habitat.rarity ?? "unknown"}`}>
                  <span className="habitat__name">{habitat.name}</span>
                  {habitat.rarity && (
                    <span className="habitat__rarity">{habitat.rarity.replace("-", " ")}</span>
                  )}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <span className="tile__no-habitat">
            {obtain ? `No habitat — ${obtain}` : "No habitat"}
          </span>
        )}
      </div>
    </button>
  );
}
