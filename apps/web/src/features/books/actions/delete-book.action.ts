"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/config/auth";
import { routes } from "@/config/routes";
import { deleteStoredBook, getAnyStoredBookOwnerId } from "./books.repository";

export async function deleteBookAction(bookId: string) {
  const session = await auth();
  const ownerId = session?.user?.id?.trim();

  if (!ownerId) {
    redirect(routes.login);
  }

  const storedOwnerId = await getAnyStoredBookOwnerId(bookId);

  if (storedOwnerId !== ownerId) {
    redirect(routes.dashboard);
  }

  await deleteStoredBook(bookId);
  revalidatePath(routes.books);
  revalidatePath(routes.dashboard);
  redirect(routes.dashboard);
}
