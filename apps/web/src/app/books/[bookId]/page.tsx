import { notFound } from "next/navigation";

import { BookDetail } from "@/features/books/components/BookDetail";
import { getBookById } from "@/features/books/data/books.repository";

type BookDetailPageProps = {
  params: Promise<{
    bookId: string;
  }>;
};

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { bookId } = await params;
  const book = await getBookById(bookId);

  if (!book) {
    notFound();
  }

  return <BookDetail book={book} />;
}
