"use client";

import type {
  Book,
  BookAvailability,
  BookPhysicalCondition,
  BookVisibility,
} from "@culturando/types";
import { ChevronLeft, ChevronRight, MapPinned } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
} from "@/components/ui/page";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { routes } from "@/config/routes";
import { DeleteBookButton } from "@/features/books/components/DeleteBookButton";
import { LoanRequestForm } from "@/features/requests/components/LoanRequestForm";
import { useTranslation } from "@/hooks/useTranslation";

type BookDetailProps = {
  adjacentBooks: {
    next?: AdjacentBook;
    previous?: AdjacentBook;
  };
  book: Book;
  isAuthenticated: boolean;
  isOwner: boolean;
};

type AdjacentBook = {
  id: string;
  title: string;
};

export function BookDetail({ adjacentBooks, book, isAuthenticated, isOwner }: BookDetailProps) {
  const t = useTranslation();
  const carouselImages = book.images.map((image) => ({
    alt: image.alt ?? book.title,
    id: image.id,
    thumbnailUrl: image.thumbnailUrl ?? image.url,
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
    <TooltipProvider>
      <PageShell>
        <AdjacentBookNavigation
          nextBook={adjacentBooks.next}
          nextLabel={t("books.detail.nextBookLabel")}
          previousBook={adjacentBooks.previous}
          previousLabel={t("books.detail.previousBookLabel")}
        />
        <PageContainer size="md">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={routes.books}>{t("books.detail.breadcrumbCatalogLabel")}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{book.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <PageHeader>
            <PageHeaderContent>
              <PageEyebrow>{t("books.detail.eyebrow")}</PageEyebrow>
              <PageTitle>{book.title}</PageTitle>
              <PageDescription>{book.author}</PageDescription>
            </PageHeaderContent>
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
            {carouselImages.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto border-t bg-muted/30 p-3">
                {carouselImages.map((image) => (
                  <div
                    className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md border bg-background"
                    key={`${image.id}-thumbnail`}
                  >
                    <Image
                      alt={image.alt}
                      className="object-cover"
                      fill
                      sizes="96px"
                      src={image.thumbnailUrl}
                      unoptimized
                    />
                  </div>
                ))}
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
              {isOwner ? (
                <section className="flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold">{t("books.detail.ownerActionsTitle")}</h2>
                    <p className="text-sm text-muted-foreground">
                      {t("books.detail.ownerActionsDescription")}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button asChild variant="secondary">
                      <Link href={routes.editBook(book.id)}>{t("books.detail.editBookLabel")}</Link>
                    </Button>
                    <DeleteBookButton
                      actionLabel={t("books.detail.deleteToastActionLabel")}
                      bookId={book.id}
                      cancelLabel={t("books.detail.deleteToastCancelLabel")}
                      confirmDescription={t("books.detail.deleteToastDescription")}
                      confirmTitle={t("books.detail.deleteToastTitle")}
                      label={t("books.detail.deleteBookLabel")}
                    />
                  </div>
                </section>
              ) : null}

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
                  <p className="mt-1 font-medium">
                    {book.category ?? t("books.detail.emptyValue")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t("books.detail.publisherLabel")}
                  </p>
                  <p className="mt-1 font-medium">
                    {book.publisher ?? t("books.detail.emptyValue")}
                  </p>
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
                  <p className="mt-1 font-medium">
                    {book.language ?? t("books.detail.emptyValue")}
                  </p>
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
                {hasPublicLocation ? (
                  <div className="sm:col-span-2">
                    <Button asChild className="w-full sm:w-auto">
                      <Link href={routes.nearbyBooks(book.id)}>
                        <MapPinned aria-hidden="true" className="size-4" />
                        {t("books.detail.nearbyLabel")}
                      </Link>
                    </Button>
                  </div>
                ) : null}
              </section>
            </CardContent>
          </Card>

          {canReceiveRequests && isAuthenticated ? <LoanRequestForm bookId={book.id} /> : null}
          {canReceiveRequests && !isAuthenticated ? <LoginContactCta /> : null}
        </PageContainer>
      </PageShell>
    </TooltipProvider>
  );
}

function AdjacentBookNavigation({
  nextBook,
  nextLabel,
  previousBook,
  previousLabel,
}: {
  nextBook?: AdjacentBook;
  nextLabel: string;
  previousBook?: AdjacentBook;
  previousLabel: string;
}) {
  return (
    <>
      {previousBook ? (
        <AdjacentBookButton
          book={previousBook}
          className="left-3 sm:left-5"
          icon={<ChevronLeft aria-hidden="true" className="size-5" />}
          label={previousLabel}
          side="left"
        />
      ) : null}
      {nextBook ? (
        <AdjacentBookButton
          book={nextBook}
          className="right-3 sm:right-5"
          icon={<ChevronRight aria-hidden="true" className="size-5" />}
          label={nextLabel}
          side="right"
        />
      ) : null}
    </>
  );
}

function AdjacentBookButton({
  book,
  className,
  icon,
  label,
  side,
}: {
  book: AdjacentBook;
  className: string;
  icon: React.ReactNode;
  label: string;
  side: "left" | "right";
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={`${label}: ${book.title}`}
          asChild
          className={`fixed top-1/2 z-30 hidden size-11 -translate-y-1/2 rounded-full shadow-lg md:inline-flex ${className}`}
          size="icon"
          variant="outline"
        >
          <Link href={routes.bookDetail(book.id)}>{icon}</Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent side={side === "left" ? "right" : "left"} sideOffset={10}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function LoginContactCta() {
  const t = useTranslation();

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{t("requests.form.loginCtaTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("requests.form.loginCtaDescription")}</p>
        </div>
        <Button asChild className="shrink-0">
          <Link href={routes.login}>{t("requests.form.loginCtaLabel")}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
