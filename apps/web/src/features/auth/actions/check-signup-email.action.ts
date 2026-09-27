"use server";

import { prisma } from "@culturando/db";

import { getClientIp } from "@/lib/client-ip";
import { checkRateLimitPolicy } from "@/lib/rate-limit-policies";

/**
 * `isAvailable: null` means "unknown": the check is rate limited. The form then neither
 * blocks nor confirms the address; signupAction still rejects duplicates on submit.
 */
export async function checkSignupEmailAvailabilityAction(
  emailValue: string,
): Promise<{ isAvailable: boolean | null }> {
  const email = emailValue.trim().toLowerCase();

  if (!email) {
    return { isAvailable: false };
  }

  const rateLimit = await checkRateLimitPolicy("signupEmailCheckIp", await getClientIp());

  if (!rateLimit.allowed) {
    return { isAvailable: null };
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  return {
    isAvailable: !existingUser,
  };
}
