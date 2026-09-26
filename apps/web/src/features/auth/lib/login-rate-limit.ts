import { CredentialsSignin } from "next-auth";

import { checkRateLimitPolicy, resetRateLimitPolicy } from "@/lib/rate-limit-policies";

export const RATE_LIMITED_SIGNIN_CODE = "rate_limited";

/**
 * Thrown from authorize(). Auth.js rethrows AuthError subclasses unchanged to a server-side
 * signIn() (so loginAction can show a dedicated message) and turns them into
 * `?error=CredentialsSignin&code=rate_limited` on the /api/auth/callback/credentials route.
 */
export class RateLimitedSignin extends CredentialsSignin {
  override code = RATE_LIMITED_SIGNIN_CODE;
}

export function isRateLimitedSigninError(error: unknown) {
  return error instanceof CredentialsSignin && error.code === RATE_LIMITED_SIGNIN_CODE;
}

/**
 * Counts a login attempt per IP and per account, before any password work. Enforced in
 * authorize() rather than loginAction, so direct POSTs to the Auth.js callback are covered.
 */
export async function enforceLoginRateLimit({ ip, email }: { ip: string; email: string }) {
  const ipLimit = await checkRateLimitPolicy("loginIp", ip);

  if (!ipLimit.allowed) {
    throw new RateLimitedSignin();
  }

  const emailLimit = await checkRateLimitPolicy("loginEmail", email);

  if (!emailLimit.allowed) {
    throw new RateLimitedSignin();
  }
}

/** A successful login clears the per-account counter; the per-IP one keeps counting. */
export async function clearLoginRateLimit(email: string) {
  await resetRateLimitPolicy("loginEmail", email);
}
