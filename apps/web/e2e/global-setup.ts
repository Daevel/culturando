import { execFileSync } from "node:child_process";
import path from "node:path";

import { assertE2eDatabase, E2E_DATABASE_URL, REPO_ROOT } from "./support/e2e-env";

const SCHEMA_PATH = path.join("packages", "db", "prisma", "schema.prisma");

// Applies the committed migrations to the e2e database. `migrate deploy` is idempotent and
// creates the database when it does not exist yet, so no manual CREATE DATABASE is needed.
export default function globalSetup() {
  assertE2eDatabase(E2E_DATABASE_URL);

  const options = {
    cwd: REPO_ROOT,
    env: { ...process.env, DATABASE_URL: E2E_DATABASE_URL },
  };

  execFileSync("pnpm", ["exec", "prisma", "migrate", "deploy", "--schema", SCHEMA_PATH], {
    ...options,
    stdio: "inherit",
  });

  // Every run signs up and logs in from the same local IP: without clearing the counters,
  // consecutive runs would hit the per-IP signup limit. Other e2e data is kept for debugging.
  execFileSync("pnpm", ["exec", "prisma", "db", "execute", "--stdin", "--schema", SCHEMA_PATH], {
    ...options,
    input: 'DELETE FROM "RateLimitBucket";',
    stdio: ["pipe", "inherit", "inherit"],
  });
}
