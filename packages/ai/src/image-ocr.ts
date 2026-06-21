export type ImageOcrInput = {
  endpoint: string;
  image: ArrayBuffer;
  contentType: string;
  token?: string;
};

type ImageOcrResponse = {
  text?: string;
};

const IMAGE_OCR_TIMEOUT_MS = 10_000;

export async function extractTextFromImage(input: ImageOcrInput) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), IMAGE_OCR_TIMEOUT_MS);

  try {
    const response = await fetch(input.endpoint, {
      body: input.image,
      headers: getHeaders(input.contentType, input.token),
      method: "POST",
      signal: controller.signal,
    });

    if (!response.ok) {
      return undefined;
    }

    const data = (await response.json()) as ImageOcrResponse;
    const text = data.text?.trim();

    return text || undefined;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timeoutId);
  }
}

function getHeaders(contentType: string, token: string | undefined) {
  const headers: Record<string, string> = {
    accept: "application/json",
    "content-type": contentType,
  };

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  return headers;
}
