export type Source = "base" | "dlc" | "event";

export interface Habitat {
  id: number;
  name: string;
  rarity: string | null;
}

export interface Pokemon {
  slug: string;
  name: string;
  source: Source;
  /** Pokopia dex number. Event Pokémon are not numbered in-game. */
  number: number | null;
  /** National Pokédex number. The three event Pokémon have none published. */
  nationalNumber: number | null;
  /** Pokopia numbering as shown on a tile, e.g. "#001", "DLC #001", "Event". */
  label: string;
  /** National numbering as shown on a tile, e.g. "#163". */
  nationalLabel: string;
  types: string[];
  imageUrl: string;
  habitats: Habitat[];
  obtainMethod: string | null;
}
