import { useEffect, useMemo, useState } from "react";
import { SearchBar } from "./components/SearchBar";
import { DexToggle } from "./components/DexToggle";
import { MobileMenu } from "./components/MobileMenu";
import { Section } from "./components/Section";
import { UndoPill } from "./components/UndoPill";
import { SourceFilter, type SourceFilterValue } from "./components/SourceFilter";
import { ThemeToggle } from "./components/ThemeToggle";
import { loadPokedex, matches, normalizeQuery, sortForDex } from "./pokedex";
import type { Pokemon } from "./types";
import { useCaught } from "./useCaught";
import { useDex } from "./useDex";
import { useMediaQuery } from "./useMediaQuery";
import { useTheme } from "./useTheme";

export default function App() {
  const [pokedex, setPokedex] = useState<Pokemon[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<SourceFilterValue>("all");
  const { caught, toggle, reset, pending, undo, dismiss } = useCaught();
  const { theme, setTheme } = useTheme();
  const { dex, setDex } = useDex();
  // Matches the breakpoint in styles.css where the masthead stacks.
  const isCompact = useMediaQuery("(max-width: 560px)");

  const confirmReset = () => {
    if (window.confirm("Clear your caught list? This cannot be undone.")) reset();
  };

  useEffect(() => {
    let active = true;
    loadPokedex()
      .then((entries) => active && setPokedex(entries))
      .catch((cause: unknown) => active && setError(cause instanceof Error ? cause.message : String(cause)));
    return () => {
      active = false;
    };
  }, []);

  const normalized = useMemo(() => normalizeQuery(query), [query]);
  const ordered = useMemo(() => sortForDex(pokedex ?? [], dex), [pokedex, dex]);

  const counts = useMemo(() => {
    const entries = ordered;
    return {
      all: entries.length,
      base: entries.filter((entry) => entry.source === "base").length,
      dlc: entries.filter((entry) => entry.source === "dlc").length,
      event: entries.filter((entry) => entry.source === "event").length,
    };
  }, [ordered]);

  // The dex is already sorted, so filtering and partitioning preserve dex order.
  const { caughtList, wantedList } = useMemo(() => {
    const visible = ordered.filter(
      (entry) => (source === "all" || entry.source === source) && matches(entry, normalized, dex),
    );
    return {
      caughtList: visible.filter((entry) => caught.has(entry.slug)),
      wantedList: visible.filter((entry) => !caught.has(entry.slug)),
    };
  }, [ordered, normalized, source, dex, caught]);

  // Progress tracks the current source filter so a DLC-only view reports DLC completion.
  const scoped = useMemo(
    () => ordered.filter((entry) => source === "all" || entry.source === source),
    [ordered, source],
  );
  const scopedTotal = scoped.length;
  const scopedCaught = useMemo(
    () => scoped.filter((entry) => caught.has(entry.slug)).length,
    [scoped, caught],
  );
  const percent = scopedTotal === 0 ? 0 : Math.round((scopedCaught / scopedTotal) * 100);

  const isFiltered = normalized !== "" || source !== "all";
  const visibleCount = caughtList.length + wantedList.length;

  return (
    <div className="app">
      <header className="masthead">
        <div className="masthead__inner">
          <div className="masthead__top">
            <div className="masthead__intro">
              <h1 className="masthead__title">Pokopia Pokédex</h1>
            </div>

            {isCompact && (
              <MobileMenu
                dex={dex}
                onDexChange={setDex}
                theme={theme}
                onThemeChange={setTheme}
                canReset={caught.size > 0}
                onReset={confirmReset}
              />
            )}

            <div className="masthead__tools">
              {!isCompact && <ThemeToggle theme={theme} onChange={setTheme} />}
              <div className="progress">
                <span className="progress__figure">
                  {scopedCaught}
                  <span className="progress__of">/{scopedTotal}</span>
                </span>
                <span className="progress__percent">{percent}% caught</span>
                <div className="progress__track" role="presentation">
                  <div className="progress__fill" style={{ width: `${percent}%` }} />
                </div>
              </div>
            </div>
          </div>

          <SearchBar value={query} onChange={setQuery} count={visibleCount} isFiltered={isFiltered} />
          <div className="masthead__filters">
            <SourceFilter value={source} onChange={setSource} counts={counts} />
            {!isCompact && <DexToggle value={dex} onChange={setDex} />}
            {!isCompact && caught.size > 0 && (
              <button type="button" className="masthead__reset" onClick={confirmReset}>
                Reset
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="main">
        {error && <p className="notice notice--error">{error}</p>}
        {!error && pokedex === null && <p className="notice">Loading the Pokédex…</p>}

        {pokedex !== null && isFiltered && visibleCount === 0 && (
          <p className="notice">
            {normalized === "" ? (
              <>Nothing to show for this filter.</>
            ) : (
              <>
                Nothing matches “{query.trim()}”. Try a name like <code>Pikachu</code> or a number
                like <code>25</code>.
              </>
            )}
          </p>
        )}

        {pokedex !== null && visibleCount > 0 && (
          <>
            <Section
              title="Still to Catch"
              hint="Head to one of these habitats to find them."
              emptyMessage={
                isFiltered
                  ? "Every Pokémon in this view is already caught."
                  : "Every Pokémon is caught. The Pokédex is complete."
              }
              pokemon={wantedList}
              dex={dex}
              caught={caught}
              onToggle={toggle}
            />
            <Section
              title="Caught"
              hint="Pokémon you have already registered."
              emptyMessage={
                isFiltered
                  ? "No caught Pokémon in this view yet."
                  : "Nothing caught yet — tap a tile above to start."
              }
              pokemon={caughtList}
              dex={dex}
              caught={caught}
              onToggle={toggle}
            />
          </>
        )}
      </main>

      <UndoPill pending={pending} onUndo={undo} onDismiss={dismiss} />

      <footer className="footer">
        Data from Serebii and Pokopia Guide · {counts.all} Pokémon
      </footer>
    </div>
  );
}
