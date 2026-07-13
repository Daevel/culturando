import { BooksCatalog } from "@/features/books/components/BooksCatalog";

export default function BooksLoading() {
  return <BooksCatalog books={[]} isLoadingResults />;
}
