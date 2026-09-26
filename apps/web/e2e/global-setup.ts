import { execFileSync } from "node:child_process";
import path from "node:path";

import { assertE2eDatabase, E2E_DATABASE_URL, REPO_ROOT } from "./support/e2e-env";

// Applies the committed migrations to the e2e database. `migrate deploy` is idempotent and
// creates the database when it does not exist yet, so no manual CREATE DATABASE is needed.
export default function globalSetup() {
  assertE2eDatabase(E2E_DATABASE_URL);

  execFileSync(
    "pnpm",
    [
      "exec",
      "prisma",
      "migrate",
      "deploy",
      "--schema",
      path.join("packages", "db", "prisma", "schema.prisma"),
    ],
    {
      cwd: REPO_ROOT,
      env: { ...process.env, DATABASE_URL: E2E_DATABASE_URL },
      stdio: "inherit",
    },
  );
}
