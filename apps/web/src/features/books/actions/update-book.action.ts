"use server";

import { geocodeAddress } from "@culturando/geo";
import { revalidatePath } from "next/cache";

import { auth } from "@/config/auth";
import { routes } from "@/config/routes";
import { validateBookForm } from "../schemas/book.schema";
import type { BookFormField, BookFormState } from "../types/book-form.types";
import { saveCoverImages, saveRemoteCoverImage } from "./book-cover-storage";
import {
  getAnyStoredBookOwnerId,
  hasStoredBookWithIsbnExceptBook,
  updateStoredBook,
} from "./books.repository";

const OPEN_LIBRARY_COVER_TIMEOUT_MS = 2500;

export async function updateBookAction(
  bookId: string,
  _state: BookFormState,
  formData: FormData,
): Promise<BookFormState> {
  const session = await auth();
  const ownerId = session?.user?.id?.trim();

  if (!ownerId) {
    return { success: false, errors: {}, messageKey: "books.edit.unauthorizedMessage" };
  }

  const storedOwnerId = await getAnyStoredBookOwnerId(bookId);

  if (storedOwnerId !== ownerId) {
    return { success: false, errors: {}, messageKey: "books.edit.forbiddenMessage" };
  }

  const values = getBookFormValues(formData);
  const validation = validateBookForm(values);

  if (!validation.isValid) {
    const errors = validation.errors as Partial<Record<BookFormField, string[]>>;

    return {
      success: false,
      errors: toBookFormErrors(errors),
    };
  }

  if (!validation.data) {
    return { success: false, errors: {}, messageKey: "books.edit.genericErrorMessage" };
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
  const hasDuplicateIsbn = await hasStoredBookWithIsbnExceptBook(ownerId, bookData.isbn, bookId);

  if (hasDuplicateIsbn) {
    return {
      success: false,
      errors: {
        isbn: "Hai già pubblicato un altro libro con questo ISBN.",
      },
    };
  }

  const uploadedCover = await saveCoverImages(getUploadedCoverImages(formData));

  if (uploadedCover.error) {
    return {
      success: false,
      errors: {
        coverImage: uploadedCover.error,
      },
    };
  }

  const geocodingResult = await geocodeAddress({ addressLabel, city, province, region, country });
  const images = await getBookImages({
    uploadedCoverImages: uploadedCover.images,
    imageUrls,
    externalCoverUrl,
    isbn: bookData.isbn,
  });

  await updateStoredBook({
    bookId,
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
    replaceImages: images.length > 0,
  });

  revalidatePath(routes.books);
  revalidatePath(routes.bookDetail(bookId));
  revalidatePath(routes.dashboard);

  return { success: true, errors: {}, messageKey: "books.edit.successMessage" };
}

function getBookFormValues(formData: FormData) {
  return {
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
}

function toBookFormErrors(errors: Partial<Record<BookFormField, string[]>>) {
  return {
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
  };
}

async function getBookImages({
  uploadedCoverImages,
  imageUrls,
  externalCoverUrl,
  isbn,
}: {
  uploadedCoverImages: Array<{ url: string; thumbnailUrl?: string }>;
  imageUrls: string | undefined;
  externalCoverUrl: string | undefined;
  isbn: string | undefined;
}) {
  const manualImageUrls = parseImageUrls(imageUrls);

  if (uploadedCoverImages.length > 0) {
    return [
      ...uploadedCoverImages.map((image) => ({ ...image, source: "user_upload" as const })),
      ...manualImageUrls.map((url) => ({ url, thumbnailUrl: url, source: "user_upload" as const })),
    ];
  }

  if (manualImageUrls.length > 0) {
    return manualImageUrls.map((url) => ({
      url,
      thumbnailUrl: url,
      source: "user_upload" as const,
    }));
  }

  const openLibraryCoverUrl = normalizeOpenLibraryCoverUrl(externalCoverUrl);

  if (openLibraryCoverUrl) {
    const storedCover = await saveRemoteCoverImage(openLibraryCoverUrl);

    return [
      {
        url: storedCover.url ?? openLibraryCoverUrl,
        thumbnailUrl: storedCover.thumbnailUrl ?? getOpenLibraryThumbnailUrl(openLibraryCoverUrl),
        source: "external_api" as const,
      },
    ];
  }

  const fallbackCoverUrl = await findOpenLibraryCoverUrl(isbn);

  if (!fallbackCoverUrl) {
    return [];
  }

  const storedCover = await saveRemoteCoverImage(fallbackCoverUrl);

  return [
    {
      url: storedCover.url ?? fallbackCoverUrl,
      thumbnailUrl: storedCover.thumbnailUrl ?? getOpenLibraryThumbnailUrl(fallbackCoverUrl),
      source: "external_api" as const,
    },
  ];
}

function getUploadedCoverImages(formData: FormData) {
  const coverImages = formData.getAll("coverImages");

  if (coverImages.length > 0) {
    return coverImages;
  }

  const legacyCoverImage = formData.get("coverImage");

  return legacyCoverImage ? [legacyCoverImage] : [];
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

function getOpenLibraryThumbnailUrl(url: string) {
  return url.replace(/-L\.jpg(\?default=false)?$/, "-M.jpg$1");
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
    const response = await fetch(coverUrl, { method: "HEAD", signal: controller.signal });

    return response.ok ? coverUrl : undefined;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timeoutId);
  }
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
