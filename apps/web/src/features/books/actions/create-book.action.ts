"use server";

import { randomUUID } from "node:crypto";
import type { Book } from "@culturando/types";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { routes } from "@/config/routes";
import { createStoredBook } from "../data/books.repository";
import { validateBookForm } from "../schemas/book.schema";
import type { BookFormField, BookFormState } from "../types/book-form.types";

export async function createBookAction(
  _state: BookFormState,
  formData: FormData,
): Promise<BookFormState> {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      errors: {},
      messageKey: "books.new.unauthorizedMessage",
    };
  }

  const values = {
    title: formData.get("title"),
    author: formData.get("author"),
    isbn: formData.get("isbn"),
    publisher: formData.get("publisher"),
    publicationYear: formData.get("publicationYear"),
    language: formData.get("language"),
    description: formData.get("description"),
    status: formData.get("status"),
    visibility: formData.get("visibility"),
    condition: formData.get("condition"),
  };

  const validation = validateBookForm(values);

  if (!validation.isValid) {
    const errors = validation.errors as Partial<Record<BookFormField, string[]>>;

    return {
      success: false,
      errors: {
        title: errors.title?.[0],
        author: errors.author?.[0],
        isbn: errors.isbn?.[0],
        publisher: errors.publisher?.[0],
        publicationYear: errors.publicationYear?.[0],
        language: errors.language?.[0],
        description: errors.description?.[0],
        status: errors.status?.[0],
        visibility: errors.visibility?.[0],
        condition: errors.condition?.[0],
      },
    };
  }

  if (!validation.data) {
    return {
      success: false,
      errors: {},
      messageKey: "books.new.genericErrorMessage",
    };
  }

  const now = new Date().toISOString();
  const book: Book = {
    ...validation.data,
    id: `book-${randomUUID()}`,
    ownerId: session.user.email ?? session.user.name ?? "demo-user",
    createdAt: now,
    updatedAt: now,
  };

  await createStoredBook(book);
  revalidatePath(routes.books);

  return {
    success: true,
    errors: {},
    messageKey: "books.new.successMessage",
  };
}
