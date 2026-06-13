import { notFound } from "next/navigation";
import { getBookById } from "@/features/books/actions/books.repository";
import { BookDetail } from "@/features/books/components/BookDetail";

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
