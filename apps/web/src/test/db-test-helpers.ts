import { prisma } from "@culturando/db";

import { hashPassword } from "@/lib/password";

/**
 * Wipes every table used by the integration tests.
 *
 * Guarded by assertTestDatabase() so a misconfigured DATABASE_URL can never
 * truncate a development or production database by accident.
 */
export async function resetDatabase() {
  assertTestDatabase();

  await prisma.$transaction([
    prisma.loanRequest.deleteMany(),
    prisma.bookImage.deleteMany(),
    prisma.bookStats.deleteMany(),
    prisma.bookLocation.deleteMany(),
    prisma.book.deleteMany(),
    prisma.emailVerificationToken.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

function assertTestDatabase() {
  const url = process.env.DATABASE_URL ?? "";

  // Adjust this check to whatever naming convention you settle on for the
  // test database (env var, database name, host) — the point is to make it
  // impossible for resetDatabase() to run against anything else.
  if (!/test/i.test(url)) {
    throw new Error(
      `Refusing to reset a database whose DATABASE_URL does not look like a test database: "${url}"`,
    );
  }
}

let userCounter = 0;

type TestUserOverrides = Partial<{
  email: string;
  name: string;
  role: "user" | "admin";
  emailVerifiedAt: Date | null;
}>;

export async function createTestUser(overrides: TestUserOverrides = {}) {
  userCounter += 1;

  return prisma.user.create({
    data: {
      email: overrides.email ?? `user-${userCounter}-${Date.now()}@example.com`,
      name: overrides.name ?? `Test User ${userCounter}`,
      role: overrides.role ?? "user",
      passwordHash: await hashPassword("Password123!"),
      // Verified by default: most authorization scenarios don't care about
      // email verification, only about ownership/role. Override explicitly
      // in tests that do care about it.
      emailVerifiedAt: overrides.emailVerifiedAt ?? new Date(),
    },
  });
}

let bookCounter = 0;

type TestBookOverrides = Partial<{
  title: string;
  visibility: "public" | "private";
  availability: "available" | "consultation_only" | "loanable" | "unavailable";
}>;

export async function createTestBook(ownerId: string, overrides: TestBookOverrides = {}) {
  bookCounter += 1;

  return prisma.book.create({
    data: {
      ownerId,
      title: overrides.title ?? `Test Book ${bookCounter}`,
      author: "Test Author",
      visibility: overrides.visibility ?? "public",
      availability: overrides.availability ?? "available",
      location: {
        create: {
          addressLabel: "Via di Test 1",
          city: "Napoli",
          province: "NA",
          region: "Campania",
        },
      },
    },
  });
}

type TestLoanRequestInput = {
  bookId: string;
  requesterId: string;
  ownerId: string;
  status?: "pending" | "accepted" | "rejected" | "cancelled" | "completed";
};

export async function createTestLoanRequest(input: TestLoanRequestInput) {
  return prisma.loanRequest.create({
    data: {
      bookId: input.bookId,
      requesterId: input.requesterId,
      ownerId: input.ownerId,
      status: input.status ?? "pending",
      type: "consultation",
    },
  });
}
