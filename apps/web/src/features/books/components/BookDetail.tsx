import type {
  Book,
  BookAvailability,
  BookPhysicalCondition,
  BookVisibility,
} from "@culturando/types";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { routes } from "@/config/routes";
import { LoanRequestForm } from "@/features/requests/components/LoanRequestForm";
import { useTranslation } from "@/hooks/useTranslation";

type BookDetailProps = {
  book: Book;
};

export function BookDetail({ book }: BookDetailProps) {
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
  const hasPublicLocation =
    book.location?.publicLatitude !== undefined && book.location.publicLongitude !== undefined;
  const canReceiveRequests = book.visibility === "public" && book.availability !== "unavailable";

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
          <div className="flex flex-wrap gap-2">
            {hasPublicLocation ? (
              <Button asChild>
                <Link href={routes.nearbyBooks(book.id)}>{t("books.detail.nearbyLabel")}</Link>
              </Button>
            ) : null}
            <Button asChild variant="outline">
              <Link href={routes.books}>{t("books.detail.backToCatalogLabel")}</Link>
            </Button>
          </div>
        </div>

        <Card>
          {primaryImage ? (
            <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg bg-muted">
              <Image
                alt={primaryImage.alt ?? book.title}
                className="h-full w-full object-cover"
                fill
                sizes="(min-width: 768px) 896px, 100vw"
                src={primaryImage.url}
                unoptimized
              />
            </div>
          ) : null}
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <Badge variant={book.availability !== "unavailable" ? "default" : "secondary"}>
                {availabilityLabels[book.availability]}
              </Badge>
              <Badge variant="outline">{visibilityLabels[book.visibility]}</Badge>
              <Badge variant="outline">{physicalConditionLabels[book.physicalCondition]}</Badge>
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
                  {t("books.detail.categoryLabel")}
                </p>
                <p className="mt-1 font-medium">{book.category ?? t("books.detail.emptyValue")}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("books.detail.publisherLabel")}
                </p>
                <p className="mt-1 font-medium">{book.publisher ?? t("books.detail.emptyValue")}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("books.detail.publishedYearLabel")}
                </p>
                <p className="mt-1 font-medium">
                  {book.publishedYear ?? t("books.detail.emptyValue")}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("books.detail.languageLabel")}
                </p>
                <p className="mt-1 font-medium">{book.language ?? t("books.detail.emptyValue")}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("books.detail.locationLabel")}
                </p>
                <p className="mt-1 font-medium">
                  {book.location?.addressLabel ?? t("books.detail.emptyValue")}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("books.detail.areaLabel")}
                </p>
                <p className="mt-1 font-medium">
                  {book.location
                    ? [book.location.city, book.location.province, book.location.region]
                        .filter(Boolean)
                        .join(", ") || book.location.country
                    : t("books.detail.emptyValue")}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("books.detail.ownerLabel")}
                </p>
                <p className="mt-1 font-medium">{book.ownerId}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("books.detail.imagesLabel")}
                </p>
                <p className="mt-1 font-medium">{book.images.length}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("books.detail.viewsLabel")}
                </p>
                <p className="mt-1 font-medium">{book.stats?.viewCount ?? 0}</p>
              </div>
            </section>
          </CardContent>
        </Card>

        {canReceiveRequests ? <LoanRequestForm bookId={book.id} /> : null}
      </section>
    </main>
  );
}
