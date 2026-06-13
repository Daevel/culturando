export type BookVisibility = "public" | "private";

export type BookStatus = "available" | "reserved" | "unavailable";

export type BookCondition = "new" | "good" | "worn";

export type Book = {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  publisher?: string;
  publicationYear?: number;
  language?: string;
  description?: string;
  coverUrl?: string;
  ownerId: string;
  status: BookStatus;
  visibility: BookVisibility;
  condition: BookCondition;
  createdAt: string;
  updatedAt: string;
};
