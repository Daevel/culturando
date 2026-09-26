import { prisma } from "@culturando/db";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/config/auth", () => ({ auth: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { auth } from "@/config/auth";
import {
  createTestBook,
  createTestLoanRequest,
  createTestUser,
  resetDatabase,
} from "@/test/db-test-helpers";

import { updateLoanRequestStatusAction } from "./update-loan-request-status.action";

describe("updateLoanRequestStatusAction — authorization", () => {
  beforeEach(async () => {
    await resetDatabase();
    vi.mocked(auth).mockReset();
  });

  it("does not let the requester accept their own request", async () => {
    const owner = await createTestUser();
    const requester = await createTestUser();
    const book = await createTestBook(owner.id);
    const request = await createTestLoanRequest({
      bookId: book.id,
      requesterId: requester.id,
      ownerId: owner.id,
    });

    // The requester (not the owner) tries to accept — the repository's
    // updateMany({ where: { id, ownerId, status: "pending" } }) should
    // silently match zero rows.
    vi.mocked(auth).mockResolvedValue({ user: { id: requester.id } } as never);

    await updateLoanRequestStatusAction(request.id, "accepted");

    const stored = await prisma.loanRequest.findUniqueOrThrow({ where: { id: request.id } });
    expect(stored.status).toBe("pending");
  });

  it("does nothing for an unauthenticated caller", async () => {
    const owner = await createTestUser();
    const requester = await createTestUser();
    const book = await createTestBook(owner.id);
    const request = await createTestLoanRequest({
      bookId: book.id,
      requesterId: requester.id,
      ownerId: owner.id,
    });

    vi.mocked(auth).mockResolvedValue(null);

    await updateLoanRequestStatusAction(request.id, "accepted");

    const stored = await prisma.loanRequest.findUniqueOrThrow({ where: { id: request.id } });
    expect(stored.status).toBe("pending");
  });

  it("lets the owner accept a pending request", async () => {
    const owner = await createTestUser();
    const requester = await createTestUser();
    const book = await createTestBook(owner.id);
    const request = await createTestLoanRequest({
      bookId: book.id,
      requesterId: requester.id,
      ownerId: owner.id,
    });

    vi.mocked(auth).mockResolvedValue({ user: { id: owner.id } } as never);

    await updateLoanRequestStatusAction(request.id, "accepted");

    const stored = await prisma.loanRequest.findUniqueOrThrow({ where: { id: request.id } });
    expect(stored.status).toBe("accepted");
  });

  it("does not let the owner change a request that is no longer pending", async () => {
    const owner = await createTestUser();
    const requester = await createTestUser();
    const book = await createTestBook(owner.id);
    const request = await createTestLoanRequest({
      bookId: book.id,
      requesterId: requester.id,
      ownerId: owner.id,
      status: "rejected",
    });

    vi.mocked(auth).mockResolvedValue({ user: { id: owner.id } } as never);

    await updateLoanRequestStatusAction(request.id, "accepted");

    const stored = await prisma.loanRequest.findUniqueOrThrow({ where: { id: request.id } });
    expect(stored.status).toBe("rejected");
  });
});
