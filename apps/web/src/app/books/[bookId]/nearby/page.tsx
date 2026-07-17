import { notFound, redirect } from "next/navigation";

import { auth } from "@/config/auth";
import { routes } from "@/config/routes";
import { getBookById, getNearbyBooks } from "@/features/books/actions/books.repository";
import { NearbyBooks } from "@/features/books/components/NearbyBooks";

type NearbyBooksPageProps = {
  params: Promise<{
    bookId: string;
  }>;
};

export default async function NearbyBooksPage({ params }: NearbyBooksPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect(routes.login);
  }

  const { bookId } = await params;
  const book = await getBookById(bookId);

  if (!book) {
    notFound();
  }

  const nearbyBooks = await getNearbyBooks(book.id);

  return <NearbyBooks books={nearbyBooks} originBook={book} />;
}
