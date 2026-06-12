import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { Book } from "@culturando/types";

import { booksMock } from "../mocks/books.mock";

const booksFileCandidates = [
  join(process.cwd(), "data/books.json"),
  join(process.cwd(), "apps/web/data/books.json"),
];

export async function getBooks(): Promise<Book[]> {
  const storedBooks = await readStoredBooks();

  return [...storedBooks, ...booksMock];
}

export async function createStoredBook(book: Book) {
  const filePath = await resolveBooksFilePath();
  const books = await readStoredBooks();

  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify([book, ...books], null, 2), "utf8");
}

async function readStoredBooks() {
  try {
    const filePath = await resolveBooksFilePath();
    const content = await readFile(filePath, "utf8");
    const parsedContent = JSON.parse(content) as unknown;

    return isBookArray(parsedContent) ? parsedContent : [];
  } catch (error) {
    if (isFileSystemError(error) && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function resolveBooksFilePath() {
  for (const filePath of booksFileCandidates) {
    try {
      await access(filePath);
      return filePath;
    } catch (error) {
      if (!isFileSystemError(error) || error.code !== "ENOENT") {
        throw error;
      }
    }
  }

  return booksFileCandidates[0];
}

function isBookArray(value: unknown): value is Book[] {
  return Array.isArray(value) && value.every(isBook);
}

function isBook(value: unknown): value is Book {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const book = value as Partial<Book>;

  return (
    typeof book.id === "string" &&
    typeof book.title === "string" &&
    typeof book.author === "string" &&
    typeof book.ownerId === "string" &&
    isBookStatus(book.status) &&
    isBookVisibility(book.visibility) &&
    typeof book.createdAt === "string" &&
    typeof book.updatedAt === "string"
  );
}

function isBookStatus(value: unknown) {
  return value === "available" || value === "reserved" || value === "unavailable";
}

function isBookVisibility(value: unknown) {
  return value === "public" || value === "private";
}

function isFileSystemError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
