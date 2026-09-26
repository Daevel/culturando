import { prisma } from "@culturando/db";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/config/auth", () => ({ auth: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { auth } from "@/config/auth";
import { createTestBook, createTestUser, resetDatabase } from "@/test/db-test-helpers";

import type { BookFormState } from "../types/book-form.types";
import { updateBookAction } from "./update-book.action";

const initialState: BookFormState = { success: false, errors: {} };

// NOTE: the ownership check in updateBookAction runs before form validation,
// so an empty FormData is enough for the negative cases below — we never
// reach the fields that would otherwise be required.

describe("updateBookAction — authorization", () => {
  beforeEach(async () => {
    await resetDatabase();
    vi.mocked(auth).mockReset();
  });

  it("blocks a user who does not own the book, and leaves it unchanged", async () => {
    const owner = await createTestUser();
    const otherUser = await createTestUser();
    const book = await createTestBook(owner.id, { title: "Original title" });

    vi.mocked(auth).mockResolvedValue({ user: { id: otherUser.id } } as never);

    const result = await updateBookAction(book.id, initialState, new FormData());

    expect(result.success).toBe(false);
    expect(result.messageKey).toBe("books.edit.forbiddenMessage");

    const storedBook = await prisma.book.findUniqueOrThrow({ where: { id: book.id } });
    expect(storedBook.title).toBe("Original title");
  });

  it("blocks an unauthenticated request", async () => {
    const owner = await createTestUser();
    const book = await createTestBook(owner.id, { title: "Original title" });

    vi.mocked(auth).mockResolvedValue(null);

    const result = await updateBookAction(book.id, initialState, new FormData());

    expect(result.success).toBe(false);
    expect(result.messageKey).toBe("books.edit.unauthorizedMessage");
  });
});
