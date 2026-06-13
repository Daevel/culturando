"use server";

import { randomUUID } from "node:crypto";
import type { Book } from "@culturando/types";
import { revalidatePath } from "next/cache";

import { auth } from "@/config/auth";
import { routes } from "@/config/routes";
import { validateBookForm } from "../schemas/book.schema";
import type { BookFormField, BookFormState } from "../types/book-form.types";
import { createStoredBook } from "./books.repository";

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
    description: formData.get("description"),
    category: formData.get("category"),
    availability: formData.get("availability"),
    visibility: formData.get("visibility"),
    physicalCondition: formData.get("physicalCondition"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
    radiusMeters: formData.get("radiusMeters"),
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
        description: errors.description?.[0],
        category: errors.category?.[0],
        availability: errors.availability?.[0],
        visibility: errors.visibility?.[0],
        physicalCondition: errors.physicalCondition?.[0],
        latitude: errors.latitude?.[0],
        longitude: errors.longitude?.[0],
        radiusMeters: errors.radiusMeters?.[0],
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
  const { latitude, longitude, radiusMeters, ...bookData } = validation.data;
  const book: Book = {
    ...bookData,
    id: `book-${randomUUID()}`,
    ownerId: session.user.email ?? session.user.name ?? "demo-user",
    approximateLocation:
      latitude !== undefined && longitude !== undefined && radiusMeters !== undefined
        ? { latitude, longitude, radiusMeters }
        : undefined,
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
