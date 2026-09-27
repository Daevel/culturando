import { prisma } from "@culturando/db";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/config/auth", () => ({ auth: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { auth } from "@/config/auth";
import { rateLimitPolicies } from "@/lib/rate-limit-policies";
import { createTestBook, createTestUser, resetDatabase } from "@/test/db-test-helpers";

import type { LoanRequestFormState } from "../types/loan-request-form.types";
import { createLoanRequestAction } from "./create-loan-request.action";

const initialState: LoanRequestFormState = { success: false, errors: {} };

// Mirrors LoanRequestForm: the textarea is always submitted, as "" when left
// empty. Omitting it would make formData.get("message") return null, which
// the Zod schema (string().optional()) rejects.
function formDataFor(type: "consultation" | "loan" | "info") {
  const formData = new FormData();
  formData.set("type", type);
  formData.set("message", "");
  return formData;
}

describe("createLoanRequestAction — authorization", () => {
  beforeEach(async () => {
    await resetDatabase();
    vi.mocked(auth).mockReset();
  });

  it("blocks an owner from requesting their own book", async () => {
    const owner = await createTestUser();
    const book = await createTestBook(owner.id);

    vi.mocked(auth).mockResolvedValue({ user: { id: owner.id } } as never);

    const result = await createLoanRequestAction(
      book.id,
      initialState,
      formDataFor("consultation"),
    );

    expect(result.success).toBe(false);
    expect(result.messageKey).toBe("requests.form.ownerMessage");

    const requests = await prisma.loanRequest.findMany({ where: { bookId: book.id } });
    expect(requests).toHaveLength(0);
  });

  it("blocks an unauthenticated request", async () => {
    const owner = await createTestUser();
    const book = await createTestBook(owner.id);

    vi.mocked(auth).mockResolvedValue(null);

    const result = await createLoanRequestAction(
      book.id,
      initialState,
      formDataFor("consultation"),
    );

    expect(result.success).toBe(false);
    expect(result.messageKey).toBe("requests.form.unauthorizedMessage");
  });

  it("allows another user to request a public, available book", async () => {
    const owner = await createTestUser();
    const requester = await createTestUser();
    const book = await createTestBook(owner.id);

    vi.mocked(auth).mockResolvedValue({ user: { id: requester.id } } as never);

    const result = await createLoanRequestAction(book.id, initialState, formDataFor("loan"));

    expect(result.success).toBe(true);

    const requests = await prisma.loanRequest.findMany({ where: { bookId: book.id } });
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      requesterId: requester.id,
      ownerId: owner.id,
      status: "pending",
      type: "loan",
    });
  });

  it("blocks a requester who exceeded the per-user request limit", async () => {
    const owner = await createTestUser();
    const requester = await createTestUser();
    const book = await createTestBook(owner.id);
    const { limit } = rateLimitPolicies.loanRequestUser;

    vi.mocked(auth).mockResolvedValue({ user: { id: requester.id } } as never);

    for (let index = 0; index < limit; index += 1) {
      const result = await createLoanRequestAction(book.id, initialState, formDataFor("info"));
      expect(result.success).toBe(true);
    }

    const blocked = await createLoanRequestAction(book.id, initialState, formDataFor("info"));

    expect(blocked).toMatchObject({
      success: false,
      messageKey: "requests.form.rateLimitedMessage",
    });
    expect(await prisma.loanRequest.count({ where: { requesterId: requester.id } })).toBe(limit);
  });
});
