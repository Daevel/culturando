import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@culturando/db";

const tokenTtlMs = 1000 * 60 * 60 * 24;

export type EmailVerificationResult = "success" | "invalid-token" | "expired-token";

export async function createEmailVerificationToken(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashVerificationToken(token);
  const expiresAt = new Date(Date.now() + tokenTtlMs);

  await prisma.emailVerificationToken.deleteMany({
    where: {
      userId,
    },
  });

  await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return token;
}

export async function confirmEmailVerificationToken(
  token: string,
): Promise<{ status: EmailVerificationResult }> {
  const tokenHash = hashVerificationToken(token);
  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: {
      tokenHash,
    },
    select: {
      expiresAt: true,
      userId: true,
    },
  });

  if (!verificationToken) {
    return { status: "invalid-token" satisfies EmailVerificationResult };
  }

  if (verificationToken.expiresAt < new Date()) {
    await prisma.emailVerificationToken.deleteMany({
      where: {
        userId: verificationToken.userId,
      },
    });

    return { status: "expired-token" satisfies EmailVerificationResult };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: verificationToken.userId,
      },
      data: {
        emailVerifiedAt: new Date(),
      },
    }),
    prisma.emailVerificationToken.deleteMany({
      where: {
        userId: verificationToken.userId,
      },
    }),
  ]);

  return { status: "success" satisfies EmailVerificationResult };
}

function hashVerificationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
