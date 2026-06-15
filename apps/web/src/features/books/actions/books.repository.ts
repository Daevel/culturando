import { prisma } from "@culturando/db";
import type { Book } from "@culturando/types";

import { booksMock } from "../mocks/books.mock";

type StoredBook = Awaited<ReturnType<typeof findStoredBooks>>[number];

export type CreateStoredBookInput = {
  owner: {
    email: string;
    name?: string;
  };
  book: {
    title: string;
    author: string;
    isbn?: string;
    publisher?: string;
    publishedYear?: number;
    language?: string;
    description?: string;
    category?: string;
    availability: Book["availability"];
    visibility: Book["visibility"];
    physicalCondition: Book["physicalCondition"];
  };
  location: {
    addressLabel: string;
    city?: string;
    province?: string;
    region?: string;
    country: string;
  };
  imageUrls: string[];
};

export async function getBooks(): Promise<Book[]> {
  const storedBooks = await findStoredBooks();

  return [...storedBooks.map(toBook), ...booksMock];
}

export async function getBookById(bookId: string): Promise<Book | null> {
  const mockBook = booksMock.find((book) => book.id === bookId);

  if (mockBook) {
    return mockBook;
  }

  const book = await prisma.book.findUnique({
    where: {
      id: bookId,
    },
    include: {
      images: {
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      },
      location: true,
    },
  });

  return book ? toBook(book) : null;
}

export async function createStoredBook(input: CreateStoredBookInput) {
  return prisma.$transaction(async (transaction) => {
    const owner = await transaction.user.upsert({
      where: {
        email: input.owner.email,
      },
      update: {
        name: input.owner.name,
      },
      create: {
        email: input.owner.email,
        name: input.owner.name,
      },
    });

    return transaction.book.create({
      data: {
        ...input.book,
        ownerId: owner.id,
        location: {
          create: input.location,
        },
        images: {
          create: input.imageUrls.map((url, index) => ({
            url,
            source: "user_upload",
            alt: `${input.book.title} - immagine ${index + 1}`,
            isPrimary: index === 0,
          })),
        },
      },
    });
  });
}

function findStoredBooks() {
  return prisma.book.findMany({
    include: {
      images: {
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      },
      location: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

function toBook(book: StoredBook): Book {
  return {
    id: book.id,
    ownerId: book.ownerId,
    title: book.title,
    author: book.author,
    isbn: book.isbn ?? undefined,
    description: book.description ?? undefined,
    publisher: book.publisher ?? undefined,
    publishedYear: book.publishedYear ?? undefined,
    language: book.language ?? undefined,
    category: book.category ?? undefined,
    availability: book.availability,
    visibility: book.visibility,
    physicalCondition: book.physicalCondition,
    location: book.location
      ? {
          id: book.location.id,
          addressLabel: book.location.addressLabel,
          city: book.location.city ?? undefined,
          province: book.location.province ?? undefined,
          region: book.location.region ?? undefined,
          country: book.location.country,
          latitude: book.location.latitude ?? undefined,
          longitude: book.location.longitude ?? undefined,
          publicLatitude: book.location.publicLatitude ?? undefined,
          publicLongitude: book.location.publicLongitude ?? undefined,
          accuracyRadiusMeters: book.location.accuracyRadiusMeters,
        }
      : undefined,
    images: book.images.map((image) => ({
      id: image.id,
      bookId: image.bookId,
      url: image.url,
      source: image.source,
      alt: image.alt ?? undefined,
      isPrimary: image.isPrimary,
      createdAt: image.createdAt.toISOString(),
    })),
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
  };
}
