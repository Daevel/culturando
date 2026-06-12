import type { Book } from "@culturando/types";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { useTranslation } from "@/hooks/useTranslation";
import { booksMock } from "../mocks/books.mock";
import { BookGrid } from "./BookGrid";

type BooksCatalogProps = {
  books?: Book[];
};

export function BooksCatalog({ books = booksMock }: BooksCatalogProps) {
  const t = useTranslation();

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <section className="mx-auto flex max-w-6xl flex-col gap-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              {t("books.catalog.eyebrow")}
            </p>
            <h1 className="max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
              {t("books.catalog.title")}
            </h1>
            <p className="max-w-2xl text-muted-foreground">{t("books.catalog.description")}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="outline">
              <Link href={routes.dashboard}>{t("books.catalog.dashboardLabel")}</Link>
            </Button>
            <Button asChild>
              <Link href={routes.newBook}>{t("books.catalog.newBookLabel")}</Link>
            </Button>
          </div>
        </div>

        <BookGrid books={books} />
      </section>
    </main>
  );
}
