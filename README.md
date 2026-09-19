# Pokopia Pokédex

A habitat reference and catch checklist for **Pokémon Pokopia**, live at
**[pokopia.gemovationlabs.com](https://pokopia.gemovationlabs.com/)**.

Pokopia numbers its own Pokédex 1–300, and that numbering has nothing to do with
the National Pokédex beyond the first nine entries — Hoothoot is Pokopia #048 and
National #163. Looking a Pokémon up therefore means knowing which number you are
holding, and knowing which habitats it actually shows up in. This site answers
both, and remembers which ones you have already caught.

## The site

- **All 357 Pokémon** — 300 base, 52 from the DLC, and 5 event Pokémon.
- **Either numbering.** A toggle switches the whole list between Pokopia and
  National order, labelling and searching by whichever is active.
- **Habitats per Pokémon**, listed most-common first so the likeliest place to
  find one leads the tile.
- **Catch checklist.** Tap a tile to mark it caught; the list splits into caught
  and still-wanted, with a progress count and a six-second undo window.
- **Filters** by source (base / DLC / event) and a search box that matches
  names and dex numbers. Progress follows the filter, so a DLC-only view
  reports DLC completion.
- **Light and dark themes**, applied before first paint so the page never flashes
  the wrong one.

The checklist lives in the browser's `localStorage` under `pokopia:caught:v1`. It
is per-browser and never leaves the device — there is no account, no backend, and
nothing to sign in to. Clearing site data clears the checklist.

## Layout

| Path | Contents |
| --- | --- |
| `data/` | The Pokédex JSON. The single source of truth for everything the site shows. |
| `web/` | The front end: React 19 + TypeScript, built with Vite. |
| `terraform/` | The hosting stack: S3 + CloudFront + ACM, with DNS on Cloudflare. See [`terraform/README.md`](terraform/README.md). |
| `Justfile` | Task runner for both halves — infrastructure and deploys. |

## Data

`data/pokopia.json` holds one record per Pokémon: Pokopia and National dex
numbers, types, specialties, favorites, active times of day, weather, how it is
obtained, evolution links, and the habitats it appears in with a rarity and the
materials each habitat needs. `data/habitats.json` holds the inverse view — 249
habitats, each with its materials and the Pokémon that show up there.

Records carry their own provenance in a `sources` field; the data was assembled
from [pokopiaguide.com](https://pokopiaguide.com) and
[Serebii](https://www.serebii.net/pokemonpokopia/), and each entry keeps the
upstream page URLs it came from.

`data/` is deliberately *not* duplicated under `web/public/`. A small Vite plugin
(`pokedexData` in `web/vite.config.ts`) serves those files at the site root in
dev and copies them into `dist/` at build time, so the JSON has exactly one home.
The app currently reads `pokopia.json`; `habitats.json` is published alongside it
but not yet consumed by the front end.

## Working on the site

Requires Node 20.19+ (or 22.12+) — what Vite 7 expects.

```bash
cd web
npm install
npm run dev      # http://localhost:5173
npm run build    # type-checks, then builds to web/dist
```

## Deploying

Deploys and infrastructure both run through [`just`](https://just.systems). Run
`just` on its own to list the recipes.

| Recipe | What it does |
| --- | --- |
| `just build` | Builds the web app into `web/dist`. |
| `just sync` | Uploads `web/dist` to the origin bucket, with fingerprinted assets cached for a year and everything else for five minutes. |
| `just invalidate` | Clears the CloudFront cache for the files that keep stable names. |
| `just deploy` | All three, in order. |
| `just init` / `just plan` / `just apply` | Terraform, against `terraform/`. |
| `just check` | `terraform fmt -check` and `terraform validate`. |

The Terraform and AWS recipes need credentials. Copy `.envrc.example` to `.envrc`
and fill in the Cloudflare API token — the Justfile loads `.envrc` as its dotenv
file, and `.envrc` is gitignored. AWS credentials come from your usual
environment or profile.

## Infrastructure

A private S3 bucket behind a CloudFront distribution, served over HTTPS with an
ACM certificate, with DNS on Cloudflare because `gemovationlabs.com` is not on
Route 53. Terraform state is local and gitignored.
[`terraform/README.md`](terraform/README.md) covers the modules, the certificate
validation wiring, the cache split, and the defaults that are overridden on
purpose.

## Notes

- `pyproject.toml` and `uv.lock` declare a Python 3.14 environment with FastAPI,
  httpx, and Uvicorn, from the data-collection work. No Python source is checked
  in at the moment.
- Pokémon and Pokémon Pokopia are trademarks of Nintendo, Creatures Inc., and
  GAME FREAK Inc. This is an unofficial fan project with no affiliation to any of
  them.
