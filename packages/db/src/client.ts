import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const cachedPrisma = globalForPrisma.prisma;

export const prisma =
  cachedPrisma && hasCurrentPrismaSchema(cachedPrisma) ? cachedPrisma : new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

function hasCurrentPrismaSchema(client: PrismaClient) {
  return "emailVerificationToken" in client;
}
