import { createReadStream } from "node:fs";
import { cp, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const dataDir = fileURLToPath(new URL("../data", import.meta.url));
const outDir = fileURLToPath(new URL("dist", import.meta.url));

/**
 * ../data is the single source of truth for the Pokedex JSON, so rather than
 * keeping a copy under public/ this serves those files at the site root in dev
 * and copies them into the build output.
 */
function pokedexData(): Plugin {
  return {
    name: "pokedex-data",

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? "").split("?")[0];
        const name = path.basename(url);

        // Top-level *.json only, which also rules out any path traversal.
        if (!name.endsWith(".json") || `/${name}` !== url) return next();

        const file = path.join(dataDir, name);
        stat(file)
          .then(() => {
            res.setHeader("Content-Type", "application/json");
            createReadStream(file).pipe(res);
          })
          .catch(() => next());
      });
    },

    async closeBundle() {
      await cp(dataDir, outDir, { recursive: true });
    },
  };
}

export default defineConfig({
  plugins: [react(), pokedexData()],
  base: "./",
});
