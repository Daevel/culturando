"use server";

import { extractIsbnFromText, extractTextFromImage } from "@culturando/ai";

const MAX_OCR_IMAGE_SIZE_BYTES = 6 * 1024 * 1024;
const supportedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export type ExtractIsbnFromImageResult =
  | {
      success: true;
      isbn: string;
      text: string;
    }
  | {
      success: false;
      reason:
        | "invalid-file"
        | "missing-image"
        | "not-configured"
        | "not-found"
        | "too-large"
        | "unsupported-type";
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
  const text = mockText || (await extractTextWithCloudflare(image));

  if (text === undefined) {
    return {
      success: false,
      reason: getOcrEndpoint() ? "invalid-file" : "not-configured",
    };
  }

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
    text,
  };
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

function getOcrEndpoint() {
  return process.env.CLOUDFLARE_OCR_ENDPOINT?.trim();
}
