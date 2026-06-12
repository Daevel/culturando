import type { Book, BookStatus, BookVisibility } from "@culturando/types";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";

type BookCardProps = {
  book: Book;
};

export function BookCard({ book }: BookCardProps) {
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
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="gap-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <CardTitle className="text-xl leading-tight">{book.title}</CardTitle>
            <p className="text-sm font-medium text-muted-foreground">{book.author}</p>
          </div>
          <Badge variant={book.status === "available" ? "default" : "secondary"}>
            {statusLabels[book.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-y-5">
        <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">
          {book.description ?? t("books.card.emptyDescription")}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">{visibilityLabels[book.visibility]}</Badge>
          {book.isbn ? (
            <span>
              {t("books.card.isbnLabel")} {book.isbn}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
