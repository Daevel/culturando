import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { routes } from "@/config/routes";
import { NewBookPlaceholder } from "@/features/books/components/NewBookPlaceholder";

export default async function NewBookPage() {
  const session = await auth();

  if (!session?.user) {
    redirect(routes.login);
  }

  return <NewBookPlaceholder />;
}
