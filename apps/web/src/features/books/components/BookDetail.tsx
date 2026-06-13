import type { Book, BookStatus, BookVisibility } from "@culturando/types";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { routes } from "@/config/routes";
import { useTranslation } from "@/hooks/useTranslation";

type BookDetailProps = {
  book: Book;
};

export function BookDetail({ book }: BookDetailProps) {
  const t = useTranslation();
  const statusLabels = {
    available: t("books.status.available"),
    reserved: t("books.status.reserved"),
    unavailable: t("books.status.unavailable"),
  } satisfies Record<BookStatus, string>;
  const visibilityLabels = {
    public: t("books.visibility.public"),
    private: t("books.visibility.private"),
  } satisfies Record<BookVisibility, string>;

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <section className="mx-auto flex max-w-4xl flex-col gap-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">{t("books.detail.eyebrow")}</p>
            <h1 className="max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
              {book.title}
            </h1>
            <p className="text-lg text-muted-foreground">{book.author}</p>
          </div>
          <Button asChild variant="outline">
            <Link href={routes.books}>{t("books.detail.backToCatalogLabel")}</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <Badge variant={book.status === "available" ? "default" : "secondary"}>
                {statusLabels[book.status]}
              </Badge>
              <Badge variant="outline">{visibilityLabels[book.visibility]}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <section className="space-y-2">
              <h2 className="text-lg font-semibold">{t("books.detail.descriptionTitle")}</h2>
              <p className="leading-7 text-muted-foreground">
                {book.description ?? t("books.card.emptyDescription")}
              </p>
            </section>

            <section className="grid gap-4 rounded-lg bg-muted/40 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("books.card.isbnLabel")}
                </p>
                <p className="mt-1 font-medium">{book.isbn ?? t("books.detail.emptyValue")}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("books.detail.ownerLabel")}
                </p>
                <p className="mt-1 font-medium">{book.ownerId}</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
