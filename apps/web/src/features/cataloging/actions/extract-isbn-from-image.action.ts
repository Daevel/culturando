"use server";

import {
  type BookMetadataSuggestion,
  extractIsbnFromText,
  extractTextFromImage,
  type ImageOcrResult,
  type ImageOcrMetadata,
} from "@culturando/ai";

const MAX_OCR_IMAGE_SIZE_BYTES = 6 * 1024 * 1024;
const supportedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export type ExtractIsbnFromImageResult =
  | {
    success: true;
    isbn: string;
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
  const image = formData.get("image");

  if (!(image instanceof File)) {
    return {
      success: false,
      reason: "missing-image",
    };
  }

  if (!image || image.size === 0) {
    return {
      success: false,
      reason: "missing-image",
    };
  }

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

  const mockText = process.env.CLOUDFLARE_OCR_MOCK_TEXT?.trim();
  const ocrResult: ImageOcrResult | undefined = mockText
    ? { success: true, text: mockText }
    : await extractTextWithCloudflare(image);

  if (!ocrResult) {
    return {
      success: false,
      reason: "not-configured",
    };
  }

  if (!ocrResult.success) {
    return {
      success: false,
      reason: mapOcrFailureReason(ocrResult.reason),
      message: ocrResult.message,
    };
  }

  const { text } = ocrResult;
  const isbn = extractIsbnFromText(text);

  if (!isbn) {
    return {
      success: false,
      reason: "not-found",
      text,
    };
  }

  return {
    success: true,
    isbn,
    metadata: normalizeOcrMetadata(ocrResult.metadata ?? extractOcrMetadataFromText(text), isbn, text),
    text,
  };
}

function extractOcrMetadataFromText(text: string): ImageOcrMetadata | undefined {
  const jsonText = extractJsonObject(text);

  if (!jsonText) {
    return undefined;
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
    return undefined;
  }
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
  isbn: string,
  text: string,
): BookMetadataSuggestion | undefined {
  if (!metadata) {
    return undefined;
  }

  const suggestion: BookMetadataSuggestion = {
    authors: normalizeStringArray(metadata.authors),
    categories: normalizeStringArray(metadata.categories),
    description: cleanText(metadata.description),
    isbn: cleanText(metadata.isbn) ?? isbn,
    language: cleanText(metadata.language),
    publishedYear: cleanText(metadata.publishedYear),
    publisher: cleanText(metadata.publisher),
    title: cleanText(metadata.title),
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

  const fallbackTitle = inferTitleFromOcrText(text);

  return fallbackTitle
    ? {
        authors: [],
        categories: [],
        isbn,
        title: fallbackTitle,
      }
    : undefined;
}

function normalizeStringArray(value: string[] | undefined) {
  return (value ?? []).map((item) => item.trim()).filter(Boolean);
}

function cleanText(value: string | undefined) {
  return value?.replace(/\s+/g, " ").trim() || undefined;
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

function mapOcrFailureReason(reason: Exclude<Awaited<ReturnType<typeof extractTextFromImage>>, { success: true }>["reason"]) {
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
