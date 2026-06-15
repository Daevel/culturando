import { getBooks } from "@/features/books/actions/books.repository";
import { BooksCatalog } from "@/features/books/components/BooksCatalog";

export const dynamic = "force-dynamic";

export default async function BooksPage() {
  const books = await getBooks();

  return <BooksCatalog books={books} />;
}
