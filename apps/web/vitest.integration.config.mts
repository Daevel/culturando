import path from "node:path";

import { defineConfig } from "vitest/config";

// Separate from vitest.config.mts on purpose: these tests hit a real
// PostgreSQL/PostGIS database and must not run mixed in with the fast,
// dependency-free unit tests (password hashing, coordinates, Zod schemas).
export default defineConfig(() => ({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/apps/web-integration",
  // Mirrors the "@/*" path in tsconfig.json: server actions import through it.
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    name: "web-integration",
    watch: false,
    globals: true,
    environment: "node",
    include: ["src/**/*.integration.spec.{ts,tsx}"],
    reporters: ["default"],
    testTimeout: 15_000,
    hookTimeout: 15_000,
    // All integration tests share one Postgres instance and truncate tables
    // between tests: run files sequentially to avoid one test's reset wiping
    // data another test is still using. (Vitest 4 removed poolOptions.singleFork.)
    pool: "forks",
    fileParallelism: false,
  },
}));
