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

import { cancelLoanRequestAction } from "./cancel-loan-request.action";

describe("cancelLoanRequestAction — authorization", () => {
  beforeEach(async () => {
    await resetDatabase();
    vi.mocked(auth).mockReset();
  });

  it("does not let the book owner cancel a request they did not send", async () => {
    const owner = await createTestUser();
    const requester = await createTestUser();
    const book = await createTestBook(owner.id);
    const request = await createTestLoanRequest({
      bookId: book.id,
      requesterId: requester.id,
      ownerId: owner.id,
    });

    vi.mocked(auth).mockResolvedValue({ user: { id: owner.id } } as never);

    await cancelLoanRequestAction(request.id);

    const stored = await prisma.loanRequest.findUniqueOrThrow({ where: { id: request.id } });
    expect(stored.status).toBe("pending");
  });

  it("lets the requester cancel their own pending request", async () => {
    const owner = await createTestUser();
    const requester = await createTestUser();
    const book = await createTestBook(owner.id);
    const request = await createTestLoanRequest({
      bookId: book.id,
      requesterId: requester.id,
      ownerId: owner.id,
    });

    vi.mocked(auth).mockResolvedValue({ user: { id: requester.id } } as never);

    await cancelLoanRequestAction(request.id);

    const stored = await prisma.loanRequest.findUniqueOrThrow({ where: { id: request.id } });
    expect(stored.status).toBe("cancelled");
  });

  it("does not let the requester cancel a request that is already accepted", async () => {
    const owner = await createTestUser();
    const requester = await createTestUser();
    const book = await createTestBook(owner.id);
    const request = await createTestLoanRequest({
      bookId: book.id,
      requesterId: requester.id,
      ownerId: owner.id,
      status: "accepted",
    });

    vi.mocked(auth).mockResolvedValue({ user: { id: requester.id } } as never);

    await cancelLoanRequestAction(request.id);

    const stored = await prisma.loanRequest.findUniqueOrThrow({ where: { id: request.id } });
    expect(stored.status).toBe("accepted");
  });
});
