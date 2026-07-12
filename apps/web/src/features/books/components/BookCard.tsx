"use client";

import type {
  Book,
  BookAvailability,
  BookPhysicalCondition,
  BookVisibility,
} from "@culturando/types";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/routes";
import { useTranslation } from "@/hooks/useTranslation";

type BookCardProps = {
  book: Book;
};

export function BookCard({ book }: BookCardProps) {
  const t = useTranslation();
  const primaryImage = book.images.find((image) => image.isPrimary) ?? book.images[0];
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
    <Link
      aria-label={`${t("books.card.detailLabel")} ${book.title}`}
      className="group block h-full outline-none"
      href={routes.bookDetail(book.id)}
    >
      <article className="relative h-full rounded-lg border bg-card p-3 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg focus-within:border-primary/50 focus-within:shadow-lg">
        <div className="absolute inset-y-5 left-3 w-3 rounded-l-md bg-primary/20 shadow-inner" />
        <div className="relative ml-3 flex min-h-[29rem] overflow-hidden rounded-md border bg-gradient-to-br from-primary/10 via-card to-secondary/30 shadow-md">
          <div className="w-4 shrink-0 border-r bg-primary/20" />

          <div className="relative flex flex-1 flex-col overflow-hidden">
            {primaryImage ? (
              <div className="absolute inset-0 opacity-25 transition-opacity duration-200 group-hover:opacity-35">
                <Image
                  alt={primaryImage.alt ?? book.title}
                  className="object-cover blur-[1px]"
                  fill
                  sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                  src={primaryImage.url}
                  unoptimized
                />
              </div>
            ) : null}

            <div className="relative z-10 flex min-h-[29rem] flex-col justify-between p-5 text-center">
              <div className="flex justify-between gap-2 text-left">
                <Badge variant={book.availability !== "unavailable" ? "default" : "secondary"}>
                  {availabilityLabels[book.availability]}
                </Badge>
                {book.publishedYear ? (
                  <span className="rounded-md bg-background/80 px-2 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                    {book.publishedYear}
                  </span>
                ) : null}
              </div>

              <div className="mx-auto max-w-[15rem] space-y-4 py-8">
                {book.category ? (
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
                    {book.category}
                  </p>
                ) : null}
                <h2 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary">
                  {book.title}
                </h2>
                <div className="mx-auto h-px w-16 bg-primary/40" />
                <p className="text-sm font-medium text-muted-foreground">{book.author}</p>
              </div>

              <div className="space-y-4 text-left">
                <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {book.description ?? t("books.card.emptyDescription")}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {book.language ? <Badge variant="outline">{book.language}</Badge> : null}
                  <Badge variant="outline">{visibilityLabels[book.visibility]}</Badge>
                  <Badge variant="outline">{physicalConditionLabels[book.physicalCondition]}</Badge>
                  {book.isbn ? (
                    <span className="w-full truncate">
                      {t("books.card.isbnLabel")} {book.isbn}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
