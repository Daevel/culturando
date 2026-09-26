import { checkRateLimit, resetRateLimit } from "./rate-limit";

export const rateLimitPolicies = {
  // Per IP: stops one source from trying many accounts (credential stuffing).
  loginIp: { limit: 20, windowSeconds: 15 * 60 },
  // Per account: stops distributed brute force on one account. Short window and reset on
  // success, so a third party can only lock an account out briefly.
  loginEmail: { limit: 10, windowSeconds: 15 * 60 },
  // Every successful signup sends a real verification email.
  signupIp: { limit: 5, windowSeconds: 60 * 60 },
  // Unauthenticated "is this email registered?" oracle, called while the user types.
  signupEmailCheckIp: { limit: 30, windowSeconds: 60 },
  loanRequestUser: { limit: 10, windowSeconds: 60 * 60 },
} as const satisfies Record<string, { limit: number; windowSeconds: number }>;

export type RateLimitPolicyName = keyof typeof rateLimitPolicies;

export function getRateLimitKey(policy: RateLimitPolicyName, identifier: string) {
  return `${policy}:${identifier}`;
}

export function checkRateLimitPolicy(policy: RateLimitPolicyName, identifier: string) {
  const { limit, windowSeconds } = rateLimitPolicies[policy];

  return checkRateLimit(getRateLimitKey(policy, identifier), limit, windowSeconds);
}

export function resetRateLimitPolicy(policy: RateLimitPolicyName, identifier: string) {
  return resetRateLimit(getRateLimitKey(policy, identifier));
}
