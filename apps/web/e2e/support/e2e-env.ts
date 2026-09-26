import path from "node:path";

// Dedicated port, so a `pnpm dev` server on 3000 can keep running alongside the e2e server.
export const E2E_PORT = 3100;
export const E2E_BASE_URL = `http://localhost:${E2E_PORT}`;

// Separate from culturando_test: integration tests truncate every table in beforeEach,
// while the e2e flow needs its data to survive the whole run (and after it, for debugging).
export const E2E_DATABASE_URL =
  process.env.E2E_DATABASE_URL ??
  "postgresql://culturando:culturando@localhost:5433/culturando_e2e";

// `next start` output is redirected here by the Playwright webServer command, so tests can
// read the verification link that EMAIL_PROVIDER=console prints instead of sending an email.
export const SERVER_LOG_PATH = path.join(__dirname, "..", ".server.log");

export const REPO_ROOT = path.join(__dirname, "..", "..", "..", "..");

export function assertE2eDatabase(url: string) {
  if (!/e2e/i.test(url)) {
    throw new Error(
      `Refusing to run e2e tests against a database that is not an e2e one: "${url}"`,
    );
  }
}
