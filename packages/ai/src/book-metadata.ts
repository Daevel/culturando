export type BookMetadataSuggestion = {
  isbn: string;
  title?: string;
  authors: string[];
  publisher?: string;
  publishedYear?: string;
  language?: string;
  categories: string[];
  description?: string;
  coverUrl?: string;
};

type OpenLibraryBook = {
  title?: string;
  authors?: { key?: string }[];
  covers?: number[];
  description?: string | { value?: string };
  languages?: { key?: string }[];
  publish_date?: string;
  publishers?: string[];
  subjects?: string[];
};

type OpenLibraryAuthor = {
  name?: string;
};

const OPEN_LIBRARY_TIMEOUT_MS = 3500;
const languageLabels: Record<string, string> = {
  eng: "English",
  fre: "Francese",
  ger: "Tedesco",
  ita: "Italiano",
  spa: "Spagnolo",
};

export async function lookupBookMetadataByIsbn(
  isbn: string,
): Promise<BookMetadataSuggestion | undefined> {
  const normalizedIsbn = normalizeIsbn(isbn);

  if (!normalizedIsbn) {
    return undefined;
  }

  const book = await fetchOpenLibraryJson<OpenLibraryBook>(
    `https://openlibrary.org/isbn/${encodeURIComponent(normalizedIsbn)}.json`,
  );

  if (!book) {
    return undefined;
  }

  const authors = await getAuthorNames(book.authors);
  const coverId = book.covers?.[0];

  return {
    isbn: normalizedIsbn,
    title: cleanText(book.title),
    authors,
    publisher: cleanText(book.publishers?.[0]),
    publishedYear: extractYear(book.publish_date),
    language: getLanguageLabel(book.languages?.[0]?.key),
    categories: getCategories(book.subjects),
    description: getDescription(book.description),
    coverUrl: coverId
      ? `https://covers.openlibrary.org/b/id/${encodeURIComponent(coverId)}-L.jpg`
      : undefined,
  };
}

function normalizeIsbn(value: string) {
  return value.replace(/[-\s]/g, "").trim();
}

async function getAuthorNames(authors: OpenLibraryBook["authors"]) {
  if (!authors?.length) {
    return [];
  }

  const authorNames = await Promise.all(
    authors.slice(0, 4).map(async (author) => {
      if (!author.key) {
        return undefined;
      }

      const authorData = await fetchOpenLibraryJson<OpenLibraryAuthor>(
        `https://openlibrary.org${author.key}.json`,
      );

      return cleanText(authorData?.name);
    }),
  );

  return authorNames.filter((name): name is string => Boolean(name));
}

async function fetchOpenLibraryJson<T>(url: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OPEN_LIBRARY_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return undefined;
    }

    return (await response.json()) as T;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timeoutId);
  }
}

function cleanText(value: string | undefined) {
  const cleanedValue = value?.replace(/\s+/g, " ").trim();

  return cleanedValue || undefined;
}

function getDescription(description: OpenLibraryBook["description"]) {
  if (typeof description === "string") {
    return cleanText(description);
  }

  return cleanText(description?.value);
}

function extractYear(value: string | undefined) {
  return value?.match(/\b\d{4}\b/)?.[0];
}

function getLanguageLabel(languageKey: string | undefined) {
  const languageCode = languageKey?.split("/").at(-1);

  if (!languageCode) {
    return undefined;
  }

  return languageLabels[languageCode] ?? languageCode;
}

function getCategories(subjects: string[] | undefined) {
  return (subjects ?? []).map((subject) => subject.trim()).filter(Boolean).slice(0, 3);
}
