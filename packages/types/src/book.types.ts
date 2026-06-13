export type BookVisibility = "public" | "private";

export type BookStatus = "available" | "reserved" | "unavailable";

export type Book = {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  coverUrl?: string;
  ownerId: string;
  status: BookStatus;
  visibility: BookVisibility;
  createdAt: string;
  updatedAt: string;
};
