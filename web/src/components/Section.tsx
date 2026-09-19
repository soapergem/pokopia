import type { DexMode } from "../pokedex";
import type { Pokemon } from "../types";
import { PokemonTile } from "./PokemonTile";

interface Props {
  title: string;
  hint: string;
  emptyMessage: string;
  pokemon: Pokemon[];
  dex: DexMode;
  caught: Set<string>;
  onToggle: (slug: string) => void;
}

export function Section({ title, hint, emptyMessage, pokemon, dex, caught, onToggle }: Props) {
  return (
    <section className="section">
      <header className="section__head">
        <h2 className="section__title">
          {title} <span className="section__count">{pokemon.length}</span>
        </h2>
        <p className="section__hint">{hint}</p>
      </header>

      {pokemon.length === 0 ? (
        <p className="section__empty">{emptyMessage}</p>
      ) : (
        <div className="grid">
          {pokemon.map((entry) => (
            <PokemonTile
              key={entry.slug}
              pokemon={entry}
              dex={dex}
              isCaught={caught.has(entry.slug)}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </section>
  );
}
