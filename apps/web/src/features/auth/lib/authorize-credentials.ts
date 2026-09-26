import { randomBytes } from "node:crypto";

import { prisma } from "@culturando/db";

import { getClientIpFromHeaders } from "@/lib/client-ip";
import { hashPassword, verifyPassword } from "@/lib/password";
import { clearLoginRateLimit, enforceLoginRateLimit } from "./login-rate-limit";

// Real scrypt hash of a random throwaway password, computed once per server instance at
// module load (not per request). Verifying against it costs the same as a real check.
const dummyPasswordHash = hashPassword(randomBytes(32).toString("hex"));

type CredentialsInput = Partial<Record<"email" | "password", unknown>> | undefined;

/** Credentials provider logic, kept outside the NextAuth config so it can be tested. */
export async function authorizeCredentials(
  credentials: CredentialsInput,
  requestHeaders: Pick<Headers, "get">,
) {
  const email = String(credentials?.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(credentials?.password ?? "");

  if (!email || !password) {
    return null;
  }

  await enforceLoginRateLimit({ ip: getClientIpFromHeaders(requestHeaders), email });

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user?.passwordHash || !user.emailVerifiedAt) {
    // Unknown, password-less or unverified account: still run one scrypt verification, so
    // the response time does not tell these cases apart from a wrong password.
    await verifyPassword(password, await dummyPasswordHash);
    return null;
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);

  if (!isValidPassword) {
    return null;
  }

  await clearLoginRateLimit(email);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl ?? undefined,
    nickname: user.nickname ?? undefined,
    role: user.role,
    salutationPreference: user.salutationPreference,
  };
}
