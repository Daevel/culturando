import { notFound } from "next/navigation";
import { auth } from "@/config/auth";
import { getBookById, getBooks, recordBookView } from "@/features/books/actions/books.repository";
import { BookDetail } from "@/features/books/components/BookDetail";

type BookDetailPageProps = {
  params: Promise<{
    bookId: string;
  }>;
};

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { bookId } = await params;
  const [book, session, books] = await Promise.all([getBookById(bookId), auth(), getBooks()]);

  if (!book) {
    notFound();
  }

  await recordBookView(book.id);
  const currentBookIndex = books.findIndex((item) => item.id === book.id);
  const previousBook = currentBookIndex > 0 ? books[currentBookIndex - 1] : undefined;
  const nextBook =
    currentBookIndex >= 0 && currentBookIndex < books.length - 1
      ? books[currentBookIndex + 1]
      : undefined;

  return (
    <BookDetail
      adjacentBooks={{
        next: nextBook ? { id: nextBook.id, title: nextBook.title } : undefined,
        previous: previousBook ? { id: previousBook.id, title: previousBook.title } : undefined,
      }}
      book={book}
      isAuthenticated={Boolean(session?.user)}
      isOwner={session?.user?.id === book.ownerId}
    />
  );
}
