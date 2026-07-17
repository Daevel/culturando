import { prisma } from "@culturando/db";
import type { Book, BookImageSource } from "@culturando/types";

import { booksMock } from "../mocks/books.mock";

type StoredBook = Awaited<ReturnType<typeof findStoredBooks>>[number];

export type NearbyBook = {
  book: Book;
  distanceKm: number;
};

export type NearbyBooksSearchInput = {
  latitude: number;
  longitude: number;
  excludeBookId?: string;
  limit?: number;
  radiusKm?: number;
};

export type CreateStoredBookInput = {
  ownerId: string;
  book: {
    title: string;
    author?: string;
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
    latitude?: number;
    longitude?: number;
    publicLatitude?: number;
    publicLongitude?: number;
    accuracyRadiusMeters?: number;
  };
  images: Array<{
    url: string;
    thumbnailUrl?: string;
    source: BookImageSource;
  }>;
};

export type UpdateStoredBookInput = Omit<CreateStoredBookInput, "ownerId"> & {
  bookId: string;
  replaceImages: boolean;
};

export async function getBooks(): Promise<Book[]> {
  const storedBooks = await findStoredBooks();

  return [...storedBooks.map(toBook), ...booksMock];
}

export async function getBooksByOwnerId(ownerId: string): Promise<Book[]> {
  const storedBooks = await findStoredBooksByOwnerId(ownerId);

  return storedBooks.map(toBook);
}

export async function hasStoredBookWithIsbn(ownerId: string, isbn: string): Promise<boolean> {
  const books = await prisma.book.findMany({
    where: {
      ownerId,
    },
    select: {
      isbn: true,
    },
  });
  const normalizedIsbn = normalizeIsbn(isbn);

  return books.some((book) => book.isbn && normalizeIsbn(book.isbn) === normalizedIsbn);
}

export async function hasStoredBookWithIsbnExceptBook(
  ownerId: string,
  isbn: string,
  bookId: string,
): Promise<boolean> {
  const books = await prisma.book.findMany({
    where: {
      ownerId,
      id: {
        not: bookId,
      },
    },
    select: {
      isbn: true,
    },
  });
  const normalizedIsbn = normalizeIsbn(isbn);

  return books.some((book) => book.isbn && normalizeIsbn(book.isbn) === normalizedIsbn);
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
      owner: {
        select: {
          email: true,
          name: true,
          nickname: true,
        },
      },
      stats: true,
    },
  });

  return book ? toBook(book) : null;
}

export async function recordBookView(bookId: string): Promise<void> {
  const mockBook = booksMock.find((book) => book.id === bookId);

  if (mockBook) {
    return;
  }

  await prisma.bookStats.upsert({
    where: {
      bookId,
    },
    create: {
      bookId,
      viewCount: 1,
    },
    update: {
      viewCount: {
        increment: 1,
      },
    },
  });
}

export async function getStoredBookOwnerId(bookId: string): Promise<string | null> {
  const book = await prisma.book.findFirst({
    where: {
      id: bookId,
      visibility: "public",
    },
    select: {
      ownerId: true,
    },
  });

  return book?.ownerId ?? null;
}

export async function getAnyStoredBookOwnerId(bookId: string): Promise<string | null> {
  const book = await prisma.book.findUnique({
    where: {
      id: bookId,
    },
    select: {
      ownerId: true,
    },
  });

  return book?.ownerId ?? null;
}

export async function getNearbyBooks(bookId: string, limit = 6): Promise<NearbyBook[]> {
  const origin = await getBookById(bookId);
  const originLatitude = origin?.location?.publicLatitude;
  const originLongitude = origin?.location?.publicLongitude;

  if (!origin || originLatitude === undefined || originLongitude === undefined) {
    return [];
  }

  return getNearbyBooksByCoordinates({
    latitude: originLatitude,
    longitude: originLongitude,
    excludeBookId: origin.id,
    limit,
  });
}

export async function getNearbyBooksByCoordinates({
  latitude,
  longitude,
  excludeBookId,
  limit = 12,
  radiusKm = 25,
}: NearbyBooksSearchInput): Promise<NearbyBook[]> {
  const storedBooks = await findNearbyStoredBooks({
    latitude,
    longitude,
    excludeBookId,
    limit,
    radiusKm,
  });
  const mockBooks = findNearbyMockBooks({ latitude, longitude, excludeBookId, radiusKm });

  return [...storedBooks, ...mockBooks]
    .sort((first, second) => first.distanceKm - second.distanceKm)
    .slice(0, limit);
}

export async function createStoredBook(input: CreateStoredBookInput) {
  return prisma.book.create({
    data: {
      ...input.book,
      author: input.book.author ?? "",
      ownerId: input.ownerId,
      location: {
        create: input.location,
      },
      images: {
        create: input.images.map((image, index) => ({
          url: image.url,
          thumbnailUrl: image.thumbnailUrl,
          source: image.source,
          alt: `${input.book.title} - immagine ${index + 1}`,
          isPrimary: index === 0,
        })),
      },
    },
  });
}

export async function updateStoredBook(input: UpdateStoredBookInput) {
  return prisma.$transaction(async (tx) => {
    if (input.replaceImages) {
      await tx.bookImage.deleteMany({
        where: {
          bookId: input.bookId,
        },
      });
    }

    return tx.book.update({
      where: {
        id: input.bookId,
      },
      data: {
        ...input.book,
        author: input.book.author ?? "",
        location: {
          upsert: {
            create: input.location,
            update: input.location,
          },
        },
        images: input.replaceImages
          ? {
              create: input.images.map((image, index) => ({
                url: image.url,
                thumbnailUrl: image.thumbnailUrl,
                source: image.source,
                alt: `${input.book.title} - immagine ${index + 1}`,
                isPrimary: index === 0,
              })),
            }
          : undefined,
      },
    });
  });
}

export async function deleteStoredBook(bookId: string) {
  return prisma.book.delete({
    where: {
      id: bookId,
    },
  });
}

function findNearbyMockBooks({
  latitude,
  longitude,
  excludeBookId,
  radiusKm,
}: Required<Pick<NearbyBooksSearchInput, "latitude" | "longitude" | "radiusKm">> &
  Pick<NearbyBooksSearchInput, "excludeBookId">): NearbyBook[] {
  return booksMock
    .filter((book) => {
      const location = book.location;

      return (
        book.id !== excludeBookId &&
        book.visibility === "public" &&
        book.availability !== "unavailable" &&
        location?.publicLatitude !== undefined &&
        location.publicLongitude !== undefined
      );
    })
    .map((book) => {
      const distanceKm = calculateDistanceKm(
        latitude,
        longitude,
        book.location?.publicLatitude ?? latitude,
        book.location?.publicLongitude ?? longitude,
      );

      return {
        book,
        distanceKm,
      };
    })
    .filter(({ distanceKm }) => distanceKm <= radiusKm);
}

async function findNearbyStoredBooks({
  latitude,
  longitude,
  excludeBookId,
  limit,
  radiusKm,
}: Required<Omit<NearbyBooksSearchInput, "excludeBookId">> &
  Pick<NearbyBooksSearchInput, "excludeBookId">): Promise<NearbyBook[]> {
  const rows = excludeBookId
    ? await prisma.$queryRaw<NearbyStoredBookRow[]>`
        SELECT
          b.id,
          ST_Distance(
            ST_SetSRID(ST_MakePoint(l."publicLongitude", l."publicLatitude"), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
          ) / 1000 AS "distanceKm"
        FROM "Book" b
        INNER JOIN "BookLocation" l ON l."bookId" = b.id
        WHERE b.id != ${excludeBookId}
          AND b.visibility = 'public'
          AND b.availability != 'unavailable'
          AND l."publicLatitude" IS NOT NULL
          AND l."publicLongitude" IS NOT NULL
          AND ST_DWithin(
            ST_SetSRID(ST_MakePoint(l."publicLongitude", l."publicLatitude"), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
            ${radiusKm * 1000}
          )
        ORDER BY "distanceKm" ASC
        LIMIT ${limit}
      `
    : await prisma.$queryRaw<NearbyStoredBookRow[]>`
        SELECT
          b.id,
          ST_Distance(
            ST_SetSRID(ST_MakePoint(l."publicLongitude", l."publicLatitude"), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
          ) / 1000 AS "distanceKm"
        FROM "Book" b
        INNER JOIN "BookLocation" l ON l."bookId" = b.id
        WHERE b.visibility = 'public'
          AND b.availability != 'unavailable'
          AND l."publicLatitude" IS NOT NULL
          AND l."publicLongitude" IS NOT NULL
          AND ST_DWithin(
            ST_SetSRID(ST_MakePoint(l."publicLongitude", l."publicLatitude"), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
            ${radiusKm * 1000}
          )
        ORDER BY "distanceKm" ASC
        LIMIT ${limit}
      `;

  if (rows.length === 0) {
    return [];
  }

  const books = await findStoredBooksByIds(rows.map((row) => row.id));
  const booksById = new Map(books.map((book) => [book.id, toBook(book)]));

  return rows.flatMap((row) => {
    const book = booksById.get(row.id);

    return book ? [{ book, distanceKm: Number(row.distanceKm) }] : [];
  });
}

type NearbyStoredBookRow = {
  id: string;
  distanceKm: number;
};

function findStoredBooks() {
  return prisma.book.findMany({
    include: {
      images: {
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      },
      location: true,
      owner: {
        select: {
          email: true,
          name: true,
          nickname: true,
        },
      },
      stats: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

function findStoredBooksByIds(bookIds: string[]) {
  return prisma.book.findMany({
    where: {
      id: {
        in: bookIds,
      },
    },
    include: {
      images: {
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      },
      location: true,
      owner: {
        select: {
          email: true,
          name: true,
          nickname: true,
        },
      },
      stats: true,
    },
  });
}

function findStoredBooksByOwnerId(ownerId: string) {
  return prisma.book.findMany({
    where: {
      ownerId,
    },
    include: {
      images: {
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      },
      location: true,
      owner: {
        select: {
          email: true,
          name: true,
          nickname: true,
        },
      },
      stats: true,
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
    owner: {
      email: book.owner.email,
      name: book.owner.name ?? undefined,
      nickname: book.owner.nickname ?? undefined,
    },
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
      thumbnailUrl: image.thumbnailUrl ?? undefined,
      source: image.source,
      alt: image.alt ?? undefined,
      isPrimary: image.isPrimary,
      createdAt: image.createdAt.toISOString(),
    })),
    stats: {
      viewCount: book.stats?.viewCount ?? 0,
    },
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
  };
}

function calculateDistanceKm(
  fromLatitude: number,
  fromLongitude: number,
  toLatitude: number,
  toLongitude: number,
) {
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(toLatitude - fromLatitude);
  const longitudeDelta = toRadians(toLongitude - fromLongitude);
  const fromLatitudeRadians = toRadians(fromLatitude);
  const toLatitudeRadians = toRadians(toLatitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitudeRadians) * Math.cos(toLatitudeRadians) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(haversine));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function normalizeIsbn(isbn: string) {
  return isbn.replace(/[-\s]/g, "").trim();
}
