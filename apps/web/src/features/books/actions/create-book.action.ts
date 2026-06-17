"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join, sep } from "node:path";
import { geocodeAddress } from "@culturando/geo";
import { revalidatePath } from "next/cache";

import { auth } from "@/config/auth";
import { routes } from "@/config/routes";
import { validateBookForm } from "../schemas/book.schema";
import type { BookFormField, BookFormState } from "../types/book-form.types";
import { createStoredBook } from "./books.repository";

const MAX_COVER_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_COVER_IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

const OPEN_LIBRARY_COVER_TIMEOUT_MS = 2500;

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
    externalCoverUrl: formData.get("externalCoverUrl"),
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
        externalCoverUrl: errors.externalCoverUrl?.[0],
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

  const {
    addressLabel,
    city,
    province,
    region,
    country,
    imageUrls,
    externalCoverUrl,
    ...bookData
  } = validation.data;
  const ownerId = getSessionUserId(session.user);

  if (!ownerId) {
    return {
      success: false,
      errors: {},
      messageKey: "books.new.unauthorizedMessage",
    };
  }

  const uploadedCover = await saveCoverImage(formData.get("coverImage"));

  if (uploadedCover.error) {
    return {
      success: false,
      errors: {
        coverImage: uploadedCover.error,
      },
    };
  }

  const geocodingResult = await geocodeAddress({
    addressLabel,
    city,
    province,
    region,
    country,
  });

  const images = await getBookImages({
    uploadedCoverUrl: uploadedCover.url,
    imageUrls,
    externalCoverUrl,
    isbn: bookData.isbn,
  });

  await createStoredBook({
    ownerId,
    book: bookData,
    location: {
      addressLabel,
      city,
      province,
      region,
      country,
      latitude: geocodingResult?.coordinates.latitude,
      longitude: geocodingResult?.coordinates.longitude,
      publicLatitude: geocodingResult?.publicCoordinates.latitude,
      publicLongitude: geocodingResult?.publicCoordinates.longitude,
      accuracyRadiusMeters: geocodingResult?.accuracyRadiusMeters,
    },
    images,
  });
  revalidatePath(routes.books);

  return {
    success: true,
    errors: {},
    messageKey: "books.new.successMessage",
  };
}

async function getBookImages({
  uploadedCoverUrl,
  imageUrls,
  externalCoverUrl,
  isbn,
}: {
  uploadedCoverUrl: string | undefined;
  imageUrls: string | undefined;
  externalCoverUrl: string | undefined;
  isbn: string | undefined;
}) {
  const manualImageUrls = parseImageUrls(imageUrls);

  if (uploadedCoverUrl) {
    return [
      { url: uploadedCoverUrl, source: "user_upload" as const },
      ...manualImageUrls.map((url) => ({ url, source: "user_upload" as const })),
    ];
  }

  if (manualImageUrls.length > 0) {
    return manualImageUrls.map((url) => ({ url, source: "user_upload" as const }));
  }

  const openLibraryCoverUrl = normalizeOpenLibraryCoverUrl(externalCoverUrl);

  if (openLibraryCoverUrl) {
    return [{ url: openLibraryCoverUrl, source: "external_api" as const }];
  }

  const fallbackCoverUrl = await findOpenLibraryCoverUrl(isbn);

  return fallbackCoverUrl ? [{ url: fallbackCoverUrl, source: "external_api" as const }] : [];
}

function normalizeOpenLibraryCoverUrl(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  try {
    const url = new URL(value);

    return url.hostname === "covers.openlibrary.org" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

async function findOpenLibraryCoverUrl(isbn: string | undefined) {
  const normalizedIsbn = isbn?.replace(/[-\s]/g, "").trim();

  if (!normalizedIsbn) {
    return undefined;
  }

  const coverUrl = `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(
    normalizedIsbn,
  )}-L.jpg?default=false`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OPEN_LIBRARY_COVER_TIMEOUT_MS);

  try {
    const response = await fetch(coverUrl, {
      method: "HEAD",
      signal: controller.signal,
    });

    return response.ok ? coverUrl : undefined;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function saveCoverImage(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) {
    return {
      url: undefined,
      error: undefined,
    };
  }

  const extension = ALLOWED_COVER_IMAGE_TYPES[value.type as keyof typeof ALLOWED_COVER_IMAGE_TYPES];

  if (!extension) {
    return {
      url: undefined,
      error: "Carica una copertina in formato JPG, PNG o WebP.",
    };
  }

  if (value.size > MAX_COVER_IMAGE_SIZE_BYTES) {
    return {
      url: undefined,
      error: "La copertina non può superare 5 MB.",
    };
  }

  const uploadDirectory = getCoverUploadDirectory();
  const fileName = `${randomUUID()}.${extension}`;

  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(join(uploadDirectory, fileName), Buffer.from(await value.arrayBuffer()));

  return {
    url: `/uploads/book-covers/${fileName}`,
    error: undefined,
  };
}

function getCoverUploadDirectory() {
  const appPublicPath = join("apps", "web", "public");

  if (process.cwd().endsWith(`${sep}apps${sep}web`)) {
    return join(process.cwd(), "public", "uploads", "book-covers");
  }

  return join(process.cwd(), appPublicPath, "uploads", "book-covers");
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

function getSessionUserId(user: { id?: string }) {
  return user.id?.trim() || undefined;
}
