import type {
  Book,
  BookAvailability,
  BookPhysicalCondition,
  BookVisibility,
} from "@culturando/types";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/config/routes";
import { useTranslation } from "@/hooks/useTranslation";

type BookCardProps = {
  book: Book;
};

export function BookCard({ book }: BookCardProps) {
  const t = useTranslation();
  const availabilityLabels = {
    available: t("books.availability.available"),
    consultation_only: t("books.availability.consultationOnly"),
    loanable: t("books.availability.loanable"),
    unavailable: t("books.availability.unavailable"),
  } satisfies Record<BookAvailability, string>;
  const visibilityLabels = {
    public: t("books.visibility.public"),
    private: t("books.visibility.private"),
  } satisfies Record<BookVisibility, string>;
  const physicalConditionLabels = {
    new: t("books.physicalCondition.new"),
    good: t("books.physicalCondition.good"),
    worn: t("books.physicalCondition.worn"),
    damaged: t("books.physicalCondition.damaged"),
  } satisfies Record<BookPhysicalCondition, string>;

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-colors hover:border-primary/50">
      <CardHeader className="gap-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <CardTitle className="text-xl leading-tight">
              <Link className="outline-none hover:text-primary" href={routes.bookDetail(book.id)}>
                {book.title}
              </Link>
            </CardTitle>
            <p className="text-sm font-medium text-muted-foreground">{book.author}</p>
          </div>
          <Badge variant={book.availability !== "unavailable" ? "default" : "secondary"}>
            {availabilityLabels[book.availability]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-y-5">
        <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">
          {book.description ?? t("books.card.emptyDescription")}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {book.category ? <Badge variant="outline">{book.category}</Badge> : null}
          <Badge variant="outline">{visibilityLabels[book.visibility]}</Badge>
          <Badge variant="outline">{physicalConditionLabels[book.physicalCondition]}</Badge>
          {book.isbn ? (
            <span>
              {t("books.card.isbnLabel")} {book.isbn}
            </span>
          ) : null}
          <Link
            className="ml-auto font-medium text-primary hover:underline"
            href={routes.bookDetail(book.id)}
          >
            {t("books.card.detailLabel")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
