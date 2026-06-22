export type ImageOcrInput = {
  endpoint: string;
  image: ArrayBuffer;
  contentType: string;
  token?: string;
};

export type ImageOcrMetadata = {
  authors?: string[];
  categories?: string[];
  description?: string;
  isbn?: string;
  language?: string;
  publishedYear?: string;
  publisher?: string;
  title?: string;
};

type ImageOcrResponse = {
  error?: string;
  metadata?: ImageOcrMetadata;
  message?: string;
  text?: string;
};

export type ImageOcrResult =
  | {
      success: true;
      metadata?: ImageOcrMetadata;
      text: string;
    }
  | {
      success: false;
      reason: "empty-response" | "http-error" | "invalid-json" | "network-error" | "timeout";
      message?: string;
      status?: number;
    };

const IMAGE_OCR_TIMEOUT_MS = 30_000;

export async function extractTextFromImage(input: ImageOcrInput): Promise<ImageOcrResult> {
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
      return {
        success: false,
        reason: "http-error",
        message: await getResponseErrorMessage(response),
        status: response.status,
      };
    }

    const data = await parseOcrResponse(response);

    if (!data) {
      return {
        success: false,
        reason: "invalid-json",
      };
    }

    const text = data.text?.trim();

    if (!text) {
      return {
        success: false,
        reason: "empty-response",
        message: data.message ?? data.error,
      };
    }

    return {
      success: true,
      metadata: data.metadata,
      text,
    };
  } catch (error) {
    return {
      success: false,
      reason: error instanceof DOMException && error.name === "AbortError" ? "timeout" : "network-error",
      message: error instanceof Error ? error.message : undefined,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function parseOcrResponse(response: Response) {
  try {
    return (await response.json()) as ImageOcrResponse;
  } catch {
    return undefined;
  }
}

async function getResponseErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as ImageOcrResponse;

    return data.message ?? data.error;
  } catch {
    return undefined;
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
