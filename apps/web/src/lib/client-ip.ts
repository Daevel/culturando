import { headers } from "next/headers";

/** Explicit shared bucket when no proxy header is present (local development, tests). */
export const UNKNOWN_CLIENT_IP = "unknown";

/**
 * On Vercel the edge sets x-forwarded-for / x-real-ip. Outside a trusted proxy both headers
 * are client-controlled, so IP-based limits are only as reliable as the deployment in front.
 */
export function getClientIpFromHeaders(requestHeaders: Pick<Headers, "get">) {
  const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();

  if (forwardedFor) {
    return forwardedFor;
  }

  return requestHeaders.get("x-real-ip")?.trim() || UNKNOWN_CLIENT_IP;
}

/** Client IP of the current server action or route handler request. */
export async function getClientIp() {
  return getClientIpFromHeaders(await headers());
}
