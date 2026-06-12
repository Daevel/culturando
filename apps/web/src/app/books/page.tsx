import { BooksCatalog } from "@/features/books/components/BooksCatalog";
import { getBooks } from "@/features/books/data/books.repository";

export default async function BooksPage() {
  const books = await getBooks();

  return <BooksCatalog books={books} />;
}
