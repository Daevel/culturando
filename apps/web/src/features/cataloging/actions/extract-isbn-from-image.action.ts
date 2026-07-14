"use server";

import {
  type BookMetadataSuggestion,
  extractIsbnFromText,
  extractTextFromImage,
  type ImageOcrMetadata,
  type ImageOcrResult,
  lookupBookMetadataByIsbn,
  lookupBookMetadataByTitle,
} from "@culturando/ai";

const MAX_OCR_IMAGE_SIZE_BYTES = 6 * 1024 * 1024;
const MAX_OCR_IMAGES = 2;
const supportedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export type ExtractIsbnFromImageResult =
  | {
      success: true;
      isbn?: string;
      metadata?: BookMetadataSuggestion;
      text: string;
    }
  | {
      success: false;
      reason:
        | "empty-response"
        | "http-error"
        | "invalid-file"
        | "missing-image"
        | "network-error"
        | "not-configured"
        | "not-found"
        | "timeout"
        | "too-large"
        | "unsupported-type";
      message?: string;
      text?: string;
    };

export async function extractIsbnFromImageAction(
  formData: FormData,
): Promise<ExtractIsbnFromImageResult> {
  const images = getImagesFromFormData(formData);

  if (images.length === 0) {
    return {
      success: false,
      reason: "missing-image",
    };
  }

  for (const image of images) {
    if (!supportedImageTypes.has(image.type)) {
      return {
        success: false,
        reason: "unsupported-type",
      };
    }

    if (image.size > MAX_OCR_IMAGE_SIZE_BYTES) {
      return {
        success: false,
        reason: "too-large",
      };
    }
  }

  const mockText = process.env.CLOUDFLARE_OCR_MOCK_TEXT?.trim();
  const ocrResults = mockText
    ? [{ success: true, text: mockText } satisfies ImageOcrResult]
    : await Promise.all(images.map((image) => extractTextWithCloudflare(image)));

  if (ocrResults.some((ocrResult) => !ocrResult)) {
    return {
      success: false,
      reason: "not-configured",
    };
  }

  const failedOcrResult = ocrResults.find(
    (ocrResult): ocrResult is Exclude<ImageOcrResult, { success: true }> =>
      Boolean(ocrResult && !ocrResult.success),
  );

  if (failedOcrResult) {
    return {
      success: false,
      reason: mapOcrFailureReason(failedOcrResult.reason),
      message: failedOcrResult.message,
    };
  }

  const successfulOcrResults = ocrResults.filter(
    (ocrResult): ocrResult is Extract<ImageOcrResult, { success: true }> =>
      Boolean(ocrResult?.success),
  );
  const text = successfulOcrResults.map((ocrResult) => ocrResult.text).join("\n\n");
  const isbn = extractIsbnFromText(text);
  const ocrMetadata = mergeOcrMetadata(
    successfulOcrResults
      .map((ocrResult) => ocrResult.metadata)
      .filter((metadata): metadata is ImageOcrMetadata => Boolean(metadata)),
  ) ?? extractOcrMetadataFromText(text);
  const normalizedOcrMetadata = normalizeOcrMetadata(ocrMetadata, isbn, text);
  const lookupMetadata = isbn
    ? await lookupBookMetadataByIsbn(isbn)
    : await lookupBookMetadataByTitle(
        normalizedOcrMetadata?.title ?? inferTitleFromOcrText(text) ?? "",
      );
  const metadata = mergeMetadataSuggestions(normalizedOcrMetadata, lookupMetadata, isbn);

  if (!isbn && !metadata) {
    return {
      success: false,
      reason: "not-found",
      text,
    };
  }

  return {
    success: true,
    isbn,
    metadata,
    text,
  };
}

function getImagesFromFormData(formData: FormData) {
  const images = formData
    .getAll("images")
    .filter((image): image is File => image instanceof File && image.size > 0);
  const fallbackImage = formData.get("image");

  if (images.length > 0) {
    return images.slice(0, MAX_OCR_IMAGES);
  }

  return fallbackImage instanceof File && fallbackImage.size > 0 ? [fallbackImage] : [];
}

function mergeOcrMetadata(metadataItems: ImageOcrMetadata[]): ImageOcrMetadata | undefined {
  if (metadataItems.length === 0) {
    return undefined;
  }

  return metadataItems.reduce<ImageOcrMetadata>(
    (mergedMetadata, metadata) => ({
      authors: mergedMetadata.authors?.length ? mergedMetadata.authors : metadata.authors,
      categories: mergedMetadata.categories?.length
        ? mergedMetadata.categories
        : metadata.categories,
      description: mergedMetadata.description ?? metadata.description,
      isbn: mergedMetadata.isbn ?? metadata.isbn,
      language: mergedMetadata.language ?? metadata.language,
      publishedYear: mergedMetadata.publishedYear ?? metadata.publishedYear,
      publisher: mergedMetadata.publisher ?? metadata.publisher,
      title: mergedMetadata.title ?? metadata.title,
    }),
    {},
  );
}

function extractOcrMetadataFromText(text: string): ImageOcrMetadata | undefined {
  const jsonText = extractJsonObject(text);

  if (!jsonText) {
    return extractLooseOcrMetadataFromText(text);
  }

  try {
    const parsed = JSON.parse(jsonText) as unknown;

    if (!isRecord(parsed)) {
      return undefined;
    }

    if (isRecord(parsed.metadata)) {
      return parsed.metadata;
    }

    return parsed;
  } catch {
    return extractLooseOcrMetadataFromText(text);
  }
}

function extractLooseOcrMetadataFromText(text: string): ImageOcrMetadata | undefined {
  const metadata: ImageOcrMetadata = {};
  const lines = text.split("\n");

  for (const line of lines) {
    const match = line.match(
      /^\s*(?:[-*+]\s*)?(?:\*\*)?([a-zA-Z\s-]+?)(?:\*\*)?\s*[:：]\s*(.+?)\s*$/,
    );

    if (!match) {
      continue;
    }

    const key = normalizeMetadataKey(match[1]);
    const value = cleanLooseMetadataValue(match[2]);

    if (!value) {
      continue;
    }

    if (key === "isbn") {
      metadata.isbn = value.replace(/[\s-]/g, "");
    }

    if (key === "title") {
      metadata.title = value;
    }

    if (key === "authors") {
      metadata.authors = splitLooseList(value);
    }

    if (key === "publisher") {
      metadata.publisher = value;
    }

    if (key === "publishedYear") {
      metadata.publishedYear = value.match(/\b\d{4}\b/)?.[0] ?? value;
    }

    if (key === "language") {
      metadata.language = value;
    }

    if (key === "categories") {
      metadata.categories = splitLooseList(value);
    }

    if (key === "description" && !isEmptyDescription(value)) {
      metadata.description = value;
    }
  }

  const hasMetadata = Boolean(
    metadata.isbn ||
      metadata.title ||
      metadata.authors?.length ||
      metadata.publisher ||
      metadata.publishedYear ||
      metadata.language ||
      metadata.categories?.length ||
      metadata.description,
  );

  return hasMetadata ? metadata : undefined;
}

function normalizeMetadataKey(value: string) {
  const normalizedKey = value.toLowerCase().replace(/[\s_-]+/g, "");

  if (normalizedKey === "author" || normalizedKey === "authors") {
    return "authors";
  }

  if (normalizedKey === "publishedyear" || normalizedKey === "year") {
    return "publishedYear";
  }

  if (normalizedKey === "category" || normalizedKey === "categories") {
    return "categories";
  }

  return normalizedKey;
}

function cleanLooseMetadataValue(value: string) {
  return value
    .replace(/^\*+|\*+$/g, "")
    .replace(/^\[|\]$/g, "")
    .replace(/^"|"$/g, "")
    .trim();
}

function splitLooseList(value: string) {
  return value
    .replace(/^\[|\]$/g, "")
    .split(/,|;|\|/)
    .map((item) => cleanLooseMetadataValue(item))
    .filter(Boolean);
}

function isEmptyDescription(value: string) {
  return /^(no description visible|nessuna descrizione visibile|not visible|n\/a)$/i.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractJsonObject(text: string) {
  const startIndex = text.indexOf("{");
  const endIndex = text.lastIndexOf("}");

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return undefined;
  }

  return text.slice(startIndex, endIndex + 1);
}

function normalizeOcrMetadata(
  metadata: ImageOcrMetadata | undefined,
  isbn: string | undefined,
  text: string,
): BookMetadataSuggestion | undefined {
  const fallbackTitle = inferTitleFromOcrText(text);

  const suggestion: BookMetadataSuggestion = {
    authors: normalizeStringArray(metadata?.authors),
    categories: normalizeStringArray(metadata?.categories),
    description: cleanText(metadata?.description),
    isbn: cleanText(metadata?.isbn) ?? isbn,
    language: cleanText(metadata?.language),
    publishedYear: cleanText(metadata?.publishedYear),
    publisher: cleanText(metadata?.publisher),
    title: cleanText(metadata?.title) ?? fallbackTitle,
  };

  const hasMetadata = Boolean(
    suggestion.title ||
      suggestion.authors.length > 0 ||
      suggestion.publisher ||
      suggestion.publishedYear ||
      suggestion.language ||
      suggestion.categories.length > 0 ||
      suggestion.description,
  );

  if (hasMetadata) {
    return suggestion;
  }

  return undefined;
}

function mergeMetadataSuggestions(
  ocrMetadata: BookMetadataSuggestion | undefined,
  lookupMetadata: BookMetadataSuggestion | undefined,
  isbn: string | undefined,
): BookMetadataSuggestion | undefined {
  if (!ocrMetadata && !lookupMetadata && !isbn) {
    return undefined;
  }

  return {
    authors: ocrMetadata?.authors.length ? ocrMetadata.authors : (lookupMetadata?.authors ?? []),
    categories: ocrMetadata?.categories.length
      ? ocrMetadata.categories
      : (lookupMetadata?.categories ?? []),
    coverUrl: lookupMetadata?.coverUrl ?? ocrMetadata?.coverUrl,
    description: ocrMetadata?.description ?? lookupMetadata?.description,
    isbn: isbn ?? ocrMetadata?.isbn ?? lookupMetadata?.isbn,
    language: ocrMetadata?.language ?? lookupMetadata?.language,
    publishedYear: ocrMetadata?.publishedYear ?? lookupMetadata?.publishedYear,
    publisher: ocrMetadata?.publisher ?? lookupMetadata?.publisher,
    title: ocrMetadata?.title ?? lookupMetadata?.title,
  };
}

function normalizeStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return splitLooseList(value);
  }

  return [];
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() || undefined : undefined;
}

function inferTitleFromOcrText(text: string) {
  return text
    .split("\n")
    .map((line) => line.replace(/^[*#\-\s]+|[*#\-\s]+$/g, "").trim())
    .find((line) => line.length >= 4 && line.length <= 80 && !/^isbn\b/i.test(line));
}

async function extractTextWithCloudflare(image: File) {
  const endpoint = getOcrEndpoint();

  if (!endpoint) {
    return undefined;
  }

  return extractTextFromImage({
    contentType: image.type,
    endpoint,
    image: await image.arrayBuffer(),
    token: process.env.CLOUDFLARE_OCR_TOKEN?.trim() || undefined,
  });
}

function mapOcrFailureReason(
  reason: Exclude<Awaited<ReturnType<typeof extractTextFromImage>>, { success: true }>["reason"],
) {
  const reasons = {
    "empty-response": "empty-response",
    "http-error": "http-error",
    "invalid-json": "invalid-file",
    "network-error": "network-error",
    timeout: "timeout",
  } as const;

  return reasons[reason];
}

function getOcrEndpoint() {
  return process.env.CLOUDFLARE_OCR_ENDPOINT?.trim();
}
