import { notFound } from "next/navigation";

import { getBookById, getNearbyBooks } from "@/features/books/actions/books.repository";
import { NearbyBooks } from "@/features/books/components/NearbyBooks";

type NearbyBooksPageProps = {
  params: Promise<{
    bookId: string;
  }>;
};

export default async function NearbyBooksPage({ params }: NearbyBooksPageProps) {
  const { bookId } = await params;
  const book = await getBookById(bookId);

  if (!book) {
    notFound();
  }

  const nearbyBooks = await getNearbyBooks(book.id);

  return <NearbyBooks books={nearbyBooks} originBook={book} />;
}
