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
    publisher: formData.get("publisher"),
    publishedYear: formData.get("publishedYear"),
    language: formData.get("language"),
    description: formData.get("description"),
    category: formData.get("category"),
    availability: formData.get("availability"),
    visibility: formData.get("visibility"),
    physicalCondition: formData.get("physicalCondition"),
    addressLabel: formData.get("addressLabel"),
    city: formData.get("city"),
    province: formData.get("province"),
    region: formData.get("region"),
    country: formData.get("country"),
    imageUrls: formData.get("imageUrls"),
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
        publishedYear: errors.publishedYear?.[0],
        language: errors.language?.[0],
        description: errors.description?.[0],
        category: errors.category?.[0],
        availability: errors.availability?.[0],
        visibility: errors.visibility?.[0],
        physicalCondition: errors.physicalCondition?.[0],
        addressLabel: errors.addressLabel?.[0],
        city: errors.city?.[0],
        province: errors.province?.[0],
        region: errors.region?.[0],
        country: errors.country?.[0],
        imageUrls: errors.imageUrls?.[0],
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
  const { addressLabel, city, province, region, country, imageUrls, ...bookData } = validation.data;
  const bookId = `book-${randomUUID()}`;
  const imageUrlList = parseImageUrls(imageUrls);
  const book: Book = {
    ...bookData,
    id: bookId,
    ownerId: session.user.email ?? session.user.name ?? "demo-user",
    location: {
      id: `location-${randomUUID()}`,
      addressLabel,
      city,
      province,
      region,
      country,
      accuracyRadiusMeters: 750,
    },
    images: imageUrlList.map((url, index) => ({
      id: `book-image-${randomUUID()}`,
      bookId,
      url,
      source: "user_upload",
      alt: `${bookData.title} - immagine ${index + 1}`,
      isPrimary: index === 0,
      createdAt: now,
    })),
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

function parseImageUrls(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean);
}
