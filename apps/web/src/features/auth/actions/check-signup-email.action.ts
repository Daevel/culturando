"use server";

import { prisma } from "@culturando/db";

export async function checkSignupEmailAvailabilityAction(emailValue: string) {
  const email = emailValue.trim().toLowerCase();

  if (!email) {
    return { isAvailable: false };
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
