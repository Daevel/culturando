"use client";

import type { Book } from "@culturando/types";

import { useTranslation } from "@/hooks/useTranslation";

import { BookCard } from "./BookCard";

type BookGridProps = {
  books: Book[];
};

export function BookGrid({ books }: BookGridProps) {
  const t = useTranslation();

  if (books.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card px-6 py-12 text-center text-muted-foreground">
        {t("books.grid.emptyState")}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {books.map((book) => (
        <BookCard book={book} key={book.id} />
      ))}
    </div>
  );
}
