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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  PageContainer,
  PageDescription,
  PageEyebrow,
  PageHeader,
  PageHeaderContent,
  PageShell,
  PageTitle,
  ResponsiveActions,
} from "@/components/ui/page";
import { routes } from "@/config/routes";
import { LoanRequestForm } from "@/features/requests/components/LoanRequestForm";
import { useTranslation } from "@/hooks/useTranslation";

type BookDetailProps = {
  book: Book;
};

export function BookDetail({ book }: BookDetailProps) {
  const t = useTranslation();
  const carouselImages = book.images.map((image) => ({
    alt: image.alt ?? book.title,
    id: image.id,
    url: image.url,
  }));
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
  const ownerLabel = book.owner?.nickname ?? book.owner?.name ?? book.owner?.email;

  return (
    <PageShell>
      <PageContainer size="md">
        <PageHeader>
          <PageHeaderContent>
            <PageEyebrow>{t("books.detail.eyebrow")}</PageEyebrow>
            <PageTitle>{book.title}</PageTitle>
            <PageDescription>{book.author}</PageDescription>
          </PageHeaderContent>
          <ResponsiveActions>
            {hasPublicLocation ? (
              <Button asChild>
                <Link href={routes.nearbyBooks(book.id)}>{t("books.detail.nearbyLabel")}</Link>
              </Button>
            ) : null}
            <Button asChild variant="outline">
              <Link href={routes.books}>{t("books.detail.backToCatalogLabel")}</Link>
            </Button>
          </ResponsiveActions>
        </PageHeader>

        <Card>
          {carouselImages.length > 0 ? (
            <Carousel className="rounded-t-lg" opts={{ loop: carouselImages.length > 1 }}>
              <CarouselContent>
                {carouselImages.map((image) => (
                  <CarouselItem key={image.id}>
                    <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg bg-muted">
                      <Image
                        alt={image.alt}
                        className="h-full w-full object-contain"
                        fill
                        sizes="(min-width: 768px) 896px, 100vw"
                        src={image.url}
                        unoptimized
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {carouselImages.length > 1 ? (
                <>
                  <CarouselPrevious
                    aria-label={t("books.imageCarousel.previousLabel")}
                    className="left-3 bg-background/90 shadow-lg backdrop-blur hover:bg-background"
                  />
                  <CarouselNext
                    aria-label={t("books.imageCarousel.nextLabel")}
                    className="right-3 bg-background/90 shadow-lg backdrop-blur hover:bg-background"
                  />
                </>
              ) : null}
            </Carousel>
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
                <p className="mt-1 font-medium">{ownerLabel ?? t("books.detail.emptyValue")}</p>
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
      </PageContainer>
    </PageShell>
  );
}
