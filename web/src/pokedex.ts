import type { Habitat, Pokemon, Source } from "./types";

/**
 * Pokopia numbers its own dex 1-300, which is unrelated to the National Pokédex
 * beyond the first nine entries. Hoothoot, for instance, is Pokopia #048 and
 * National #163, so the list has to be explicit about which one it is showing.
 */
export type DexMode = "pokopia" | "national";

interface RawHabitat {
  id: number;
  name: string;
  rarity: string | null;
}

interface RawPokemon {
  dex_number: number | null;
  national_dex_number: number | null;
  source: Source;
  slug: string;
  name: string;
  types: string[];
  image_url: string;
  obtain_method: string | null;
  habitats: RawHabitat[];
}

const SOURCE_ORDER: Record<Source, number> = { base: 0, dlc: 1, event: 2 };

// Habitats are listed most-common first so the likeliest place to find a Pokémon
// leads the tile.
const RARITY_ORDER = ["common", "uncommon", "rare", "very-rare"];

function rarityRank(rarity: string | null): number {
  const i = RARITY_ORDER.indexOf(rarity ?? "");
  return i === -1 ? RARITY_ORDER.length : i;
}

function pad(number: number): string {
  return `#${String(number).padStart(3, "0")}`;
}

function pokopiaLabel(source: Source, number: number | null): string {
  if (number === null) return source === "event" ? "Event" : "—";
  // Both schemes start at 1, so the DLC dex needs marking to stay distinct.
  return source === "dlc" ? `DLC ${pad(number)}` : pad(number);
}

function toPokemon(raw: RawPokemon): Pokemon {
  const habitats: Habitat[] = [...raw.habitats]
    .sort((a, b) => rarityRank(a.rarity) - rarityRank(b.rarity) || a.name.localeCompare(b.name))
    .map((h) => ({ id: h.id, name: h.name, rarity: h.rarity }));

  return {
    slug: raw.slug,
    name: raw.name,
    source: raw.source,
    number: raw.dex_number,
    nationalNumber: raw.national_dex_number,
    label: pokopiaLabel(raw.source, raw.dex_number),
    nationalLabel: raw.national_dex_number === null ? "—" : pad(raw.national_dex_number),
    types: raw.types,
    imageUrl: raw.image_url,
    habitats,
    obtainMethod: raw.obtain_method,
  };
}

export function dexNumber(pokemon: Pokemon, dex: DexMode): number | null {
  return dex === "national" ? pokemon.nationalNumber : pokemon.number;
}

export function dexLabel(pokemon: Pokemon, dex: DexMode): string {
  return dex === "national" ? pokemon.nationalLabel : pokemon.label;
}

/**
 * Pokopia order groups by release first, because the base game and the DLC both
 * number from 1. National order is a single sequence across all of them, with
 * the unnumbered event Pokémon last.
 */
function compare(a: Pokemon, b: Pokemon, dex: DexMode): number {
  if (dex === "pokopia") {
    const bySource = SOURCE_ORDER[a.source] - SOURCE_ORDER[b.source];
    if (bySource !== 0) return bySource;
  }

  const left = dexNumber(a, dex);
  const right = dexNumber(b, dex);
  if (left !== right) {
    if (left === null) return 1;
    if (right === null) return -1;
    return left - right;
  }
  return a.name.localeCompare(b.name);
}

export function sortForDex(pokedex: Pokemon[], dex: DexMode): Pokemon[] {
  return [...pokedex].sort((a, b) => compare(a, b, dex));
}

export async function loadPokedex(): Promise<Pokemon[]> {
  const response = await fetch(`${import.meta.env.BASE_URL}pokopia.json`);
  if (!response.ok) {
    throw new Error(`Could not load the Pokédex data (HTTP ${response.status})`);
  }
  const raw: RawPokemon[] = await response.json();
  return raw.map(toPokemon);
}

/**
 * Matches a name substring, or a number in whichever dex is currently selected,
 * typed with or without leading zeros and an optional "#". Numbers match as a
 * prefix so the list narrows while typing.
 */
export function matches(pokemon: Pokemon, query: string, dex: DexMode): boolean {
  if (query === "") return true;
  if (pokemon.name.toLowerCase().includes(query)) return true;

  const number = dexNumber(pokemon, dex);
  if (number === null) return false;

  const digits = query.replace(/^#/, "");
  if (!/^\d+$/.test(digits)) return false;

  const value = String(number);
  return (
    value.startsWith(digits) ||
    value.padStart(3, "0").startsWith(digits) ||
    value === digits.replace(/^0+(?=\d)/, "")
  );
}

export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}
