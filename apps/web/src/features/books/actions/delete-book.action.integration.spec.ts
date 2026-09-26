import { prisma } from "@culturando/db";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/config/auth", () => ({ auth: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  // deleteBookAction always ends with redirect(); Next.js normally throws a
  // special NEXT_REDIRECT error to unwind the request. We replace it with a
  // plain, catchable error carrying the target path, so the test can assert
  // both "it redirected" and "it redirected to the expected place".
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

import { auth } from "@/config/auth";
import { routes } from "@/config/routes";
import { createTestBook, createTestUser, resetDatabase } from "@/test/db-test-helpers";

import { deleteBookAction } from "./delete-book.action";

describe("deleteBookAction — authorization", () => {
  beforeEach(async () => {
    await resetDatabase();
    vi.mocked(auth).mockReset();
  });

  it("does not delete a book owned by another user", async () => {
    const owner = await createTestUser();
    const otherUser = await createTestUser();
    const book = await createTestBook(owner.id);

    vi.mocked(auth).mockResolvedValue({ user: { id: otherUser.id } } as never);

    await expect(deleteBookAction(book.id)).rejects.toThrow(`REDIRECT:${routes.dashboard}`);

    const stillThere = await prisma.book.findUnique({ where: { id: book.id } });
    expect(stillThere).not.toBeNull();
  });

  it("blocks an unauthenticated request without touching the database", async () => {
    const owner = await createTestUser();
    const book = await createTestBook(owner.id);

    vi.mocked(auth).mockResolvedValue(null);

    await expect(deleteBookAction(book.id)).rejects.toThrow(`REDIRECT:${routes.login}`);

    const stillThere = await prisma.book.findUnique({ where: { id: book.id } });
    expect(stillThere).not.toBeNull();
  });

  it("deletes a book owned by the authenticated user", async () => {
    const owner = await createTestUser();
    const book = await createTestBook(owner.id);

    vi.mocked(auth).mockResolvedValue({ user: { id: owner.id } } as never);

    await expect(deleteBookAction(book.id)).rejects.toThrow(`REDIRECT:${routes.dashboard}`);

    const stillThere = await prisma.book.findUnique({ where: { id: book.id } });
    expect(stillThere).toBeNull();
  });
});
