import { existsSync, readFileSync } from "node:fs";

import { expect } from "@playwright/test";

import { SERVER_LOG_PATH } from "./e2e-env";

const VERIFICATION_EMAIL_MARKER = "[Culturando] Verification email";

/**
 * Waits until the server log contains the verification email printed for `email`
 * (EMAIL_PROVIDER=console, see send-verification-email.ts) and returns its path + query.
 *
 * Only the path is returned: the host comes from NEXT_PUBLIC_APP_URL, which is inlined at
 * build time, so navigating relative to the test baseURL avoids depending on it.
 */
export async function waitForVerificationUrl(email: string, timeout = 15_000): Promise<string> {
  if (!existsSync(SERVER_LOG_PATH)) {
    throw new Error(
      `Server log not found at ${SERVER_LOG_PATH}. Let Playwright start the server (webServer), ` +
        "or redirect the output of a reused `next start` to that file.",
    );
  }

  let verificationUrl: string | undefined;

  await expect
    .poll(
      () => {
        verificationUrl = findVerificationUrl(readFileSync(SERVER_LOG_PATH, "utf8"), email);
        return verificationUrl;
      },
      {
        message: `No verification email for ${email} found in ${SERVER_LOG_PATH}`,
        timeout,
      },
    )
    .toBeDefined();

  const url = new URL(verificationUrl as string);

  return `${url.pathname}${url.search}`;
}

function findVerificationUrl(log: string, email: string) {
  // Latest block first, in case the same address was registered more than once.
  const blocks = log.split(VERIFICATION_EMAIL_MARKER).slice(1).reverse();

  for (const block of blocks) {
    const to = /^To: (.+)$/m.exec(block)?.[1]?.trim().toLowerCase();

    if (to === email.toLowerCase()) {
      return /^URL: (\S+)$/m.exec(block)?.[1];
    }
  }

  return undefined;
}
