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
  const runtimeDataModel = client as PrismaClient & {
    _runtimeDataModel?: {
      models?: {
        User?: {
          fields?: Array<{ name?: string }>;
        };
      };
    };
  };
  const userFields = runtimeDataModel._runtimeDataModel?.models?.User?.fields ?? [];

  return (
    "emailVerificationToken" in client &&
    userFields.some((field) => field.name === "salutationPreference") &&
    userFields.some((field) => field.name === "addressLabel") &&
    userFields.some((field) => field.name === "postalCode") &&
    userFields.some((field) => field.name === "nickname") &&
    userFields.some((field) => field.name === "nicknameUpdatedAt")
  );
}
