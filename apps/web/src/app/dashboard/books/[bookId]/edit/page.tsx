import { notFound, redirect } from "next/navigation";

import { auth } from "@/config/auth";
import { routes } from "@/config/routes";
import { getBookById } from "@/features/books/actions/books.repository";
import { updateBookAction } from "@/features/books/actions/update-book.action";
import { EditBookPageContent } from "@/features/books/components/EditBookPageContent";

type EditBookPageProps = {
  params: Promise<{
    bookId: string;
  }>;
};

export default async function EditBookPage({ params }: EditBookPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(routes.login);
  }

  const { bookId } = await params;
  const book = await getBookById(bookId);

  if (!book) {
    notFound();
  }

  if (book.ownerId !== session.user.id) {
    redirect(routes.dashboard);
  }

  return <EditBookPageContent action={updateBookAction.bind(null, book.id)} book={book} />;
}
