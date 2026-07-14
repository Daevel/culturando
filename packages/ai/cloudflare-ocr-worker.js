const MODEL = "@cf/meta/llama-3.2-11b-vision-instruct";

const MAX_IMAGES = 2;
const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default {
  async fetch(request, env) {
    try {
      if (request.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
      }

      if (!env.AI) {
        return Response.json({ error: "AI binding missing" }, { status: 500 });
      }

      const expectedToken = env.OCR_TOKEN?.trim();

      if (expectedToken) {
        const authorization = request.headers.get("authorization");

        if (authorization !== `Bearer ${expectedToken}`) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
      }

      const images = await getImagesFromRequest(request);

      if (images.length === 0) {
        return Response.json({ error: "Missing image" }, { status: 400 });
      }

      if (images.length > MAX_IMAGES) {
        return Response.json(
          { error: `Too many images. Upload up to ${MAX_IMAGES} images.` },
          { status: 400 },
        );
      }

      const results = [];

      for (const [index, imageInput] of images.entries()) {
        const response = await env.AI.run(MODEL, {
          image: imageInput.image,
          prompt: buildPrompt({
            imageIndex: index + 1,
            totalImages: images.length,
          }),
          max_tokens: 1400,
          temperature: 0.1,
        });

        const rawText = extractResponseText(response);
        const parsed = parseModelJson(rawText);

        results.push({
          text: parsed?.text || rawText,
          metadata: normalizeMetadata(parsed?.metadata) ?? extractLooseOcrMetadataFromText(rawText),
          raw: response,
        });
      }

      const merged = mergeResults(results);

      return Response.json({
        text: merged.text,
        metadata: merged.metadata,
        images: results,
      });
    } catch (error) {
      if (error instanceof ResponseError) {
        return Response.json({ error: error.message }, { status: error.status });
      }

      return Response.json(
        {
          error: "Worker OCR failed",
          message: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      );
    }
  },
};

function buildPrompt({ imageIndex, totalImages }) {
  return `
You are an OCR and book cataloging assistant for a book upload flow.

The user may upload one or two images of the same physical book:
- front cover;
- back cover;
- or only one of them.

You are analyzing image ${imageIndex} of ${totalImages}.

Goal:
Extract visible text and reliable bibliographic metadata from this image.
The final application may merge this result with another image of the same book.

Return ONLY valid JSON, without markdown, explanations, comments, or code fences.

Schema:
{
  "text": "all visible text extracted from this image, preserving useful line breaks",
  "metadata": {
    "isbn": "ISBN-10 or ISBN-13 if visible, normalized without spaces or hyphens",
    "title": "book title if clearly visible",
    "authors": ["author names if clearly visible"],
    "publisher": "publisher if clearly visible",
    "publishedYear": "publication year if clearly visible",
    "language": "book language if clearly inferable from visible text",
    "categories": ["topics, genres, or subjects if clearly inferable"],
    "description": "main back-cover synopsis or description if visible"
  }
}

Rules:
- If a field is not visible or uncertain, use an empty string or an empty array.
- Do not invent missing bibliographic data.
- Prefer exact visible text over guesses.
- Pay special attention to ISBN-10 and ISBN-13 codes.
- Normalize ISBN by removing spaces and hyphens.
- If multiple ISBNs are visible, prefer ISBN-13.
- The title is often the largest or most prominent text on the front cover.
- Authors are usually personal names near the title or on the cover.
- Publisher can be a logo or imprint, but include it only if readable.
- For a front cover, prioritize title, authors, publisher, language, and visible categories.
- For a back cover, prioritize ISBN, synopsis/description, publisher, categories, and visible title/author only if clearly present.
- If this image is only a partial cover, extract only what is visible.
- For description, use the main back-cover synopsis text, not reviews, quotes, prices, barcodes, or legal text.
- Do not include confidence scores.
  `.trim();
}

async function getImagesFromRequest(request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (SUPPORTED_IMAGE_TYPES.includes(contentType)) {
    const imageBuffer = await request.arrayBuffer();

    return [
      {
        contentType,
        image: [...new Uint8Array(imageBuffer)],
      },
    ];
  }

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const files = [...formData.getAll("images"), ...formData.getAll("image")]
      .filter((value) => value instanceof File && value.size > 0)
      .slice(0, MAX_IMAGES);

    for (const file of files) {
      if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
        throw new ResponseError("Unsupported image type", 415);
      }
    }

    return Promise.all(
      files.map(async (file) => ({
        contentType: file.type,
        image: [...new Uint8Array(await file.arrayBuffer())],
      })),
    );
  }

  throw new ResponseError("Unsupported content type", 415);
}

function mergeResults(results) {
  const text = results
    .map((result, index) => {
      const value = result.text?.trim();

      return value ? `Image ${index + 1}:\n${value}` : "";
    })
    .filter(Boolean)
    .join("\n\n");
  const metadataItems = results.map((result) => result.metadata).filter(Boolean);

  return {
    text,
    metadata: mergeMetadata(metadataItems),
  };
}

function mergeMetadata(metadataItems) {
  if (metadataItems.length === 0) {
    return undefined;
  }

  return metadataItems.reduce(
    (merged, metadata) => ({
      isbn: preferIsbn(merged.isbn, metadata.isbn),
      title: merged.title || metadata.title,
      authors: merged.authors.length ? merged.authors : metadata.authors,
      publisher: merged.publisher || metadata.publisher,
      publishedYear: merged.publishedYear || metadata.publishedYear,
      language: merged.language || metadata.language,
      categories: uniqueStrings([...merged.categories, ...metadata.categories]).slice(0, 5),
      description: preferLongerText(merged.description, metadata.description),
    }),
    {
      isbn: undefined,
      title: undefined,
      authors: [],
      publisher: undefined,
      publishedYear: undefined,
      language: undefined,
      categories: [],
      description: undefined,
    },
  );
}

function preferIsbn(current, next) {
  if (!current) {
    return next;
  }

  if (!next) {
    return current;
  }

  if (next.length === 13 && current.length !== 13) {
    return next;
  }

  return current;
}

function preferLongerText(current, next) {
  if (!current) {
    return next;
  }

  if (!next) {
    return current;
  }

  return next.length > current.length ? next : current;
}

function uniqueStrings(values) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function extractResponseText(response) {
  if (
    typeof response === "object" &&
    response !== null &&
    typeof response.response === "string"
  ) {
    return response.response.trim();
  }

  return "";
}

function stripCodeFence(value) {
  return value
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function normalizeMetadata(metadata) {
  if (!metadata || typeof metadata !== "object") {
    return undefined;
  }

  return {
    isbn: normalizeIsbn(metadata.isbn),
    title: stringOrUndefined(metadata.title),
    authors: arrayOrEmpty(metadata.authors),
    publisher: stringOrUndefined(metadata.publisher),
    publishedYear: stringOrUndefined(metadata.publishedYear),
    language: stringOrUndefined(metadata.language),
    categories: arrayOrEmpty(metadata.categories),
    description: stringOrUndefined(metadata.description),
  };
}

function extractLooseOcrMetadataFromText(text) {
  const metadata = {};
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

function normalizeMetadataKey(value) {
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

function cleanLooseMetadataValue(value) {
  return value
    .replace(/^\*+|\*+$/g, "")
    .replace(/^\[|\]$/g, "")
    .replace(/^"|"$/g, "")
    .trim();
}

function splitLooseList(value) {
  return value
    .replace(/^\[|\]$/g, "")
    .split(/,|;|\|/)
    .map((item) => cleanLooseMetadataValue(item))
    .filter(Boolean);
}

function isEmptyDescription(value) {
  return /^(no description visible|nessuna descrizione visibile|not visible|n\/a)$/i.test(value);
}

function normalizeIsbn(value) {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.replace(/[-\s]/g, "").trim();

  return normalized || undefined;
}

function stringOrUndefined(value) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function arrayOrEmpty(value) {
  return Array.isArray(value)
    ? value
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function parseModelJson(value) {
  try {
    return JSON.parse(stripCodeFence(value));
  } catch {
    const jsonText = extractJsonObject(value);

    if (!jsonText) {
      return null;
    }

    try {
      return JSON.parse(jsonText);
    } catch {
      return null;
    }
  }
}

function extractJsonObject(value) {
  const startIndex = value.indexOf("{");
  const endIndex = value.lastIndexOf("}");

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return null;
  }

  return value.slice(startIndex, endIndex + 1);
}

class ResponseError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
