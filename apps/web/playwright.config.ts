import { defineConfig, devices } from "@playwright/test";

import {
  assertE2eDatabase,
  E2E_BASE_URL,
  E2E_DATABASE_URL,
  E2E_PORT,
  SERVER_LOG_PATH,
} from "./e2e/support/e2e-env";

assertE2eDatabase(E2E_DATABASE_URL);

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  globalSetup: "./e2e/global-setup.ts",
  // The smoke path shares one database and one server: keep it strictly sequential.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: Boolean(process.env.CI),
  reporter: [["list"], ["html", { open: "never" }]],
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: E2E_BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // Production build, not `next dev`: no on-demand route compilation (stable timings) and the
    // same behavior Vercel and a future CI step run. `next build` is called directly instead of
    // `nx build` because the Nx cache does not key on env vars such as NEXT_PUBLIC_APP_URL.
    command: `pnpm exec next build && pnpm exec next start --port ${E2E_PORT} > "${SERVER_LOG_PATH}" 2>&1`,
    url: E2E_BASE_URL,
    // Locally, reuse a running e2e server to iterate without rebuilding; its output must still
    // go to SERVER_LOG_PATH for waitForVerificationUrl to work.
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    stdout: "pipe",
    stderr: "pipe",
    // Process env wins over apps/web/.env.local, which points at the dev database and at Resend.
    env: {
      DATABASE_URL: E2E_DATABASE_URL,
      EMAIL_PROVIDER: "console",
      NEXT_PUBLIC_APP_URL: E2E_BASE_URL,
      AUTH_URL: E2E_BASE_URL,
      AUTH_SECRET: "culturando-e2e-only-secret-not-used-anywhere-else",
      // Empty key: geocoding and address suggestions fall back to Nominatim, no Geoapify quota.
      GEOAPIFY_API_KEY: "",
    },
  },
});
