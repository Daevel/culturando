"use client";

import type { Book } from "@culturando/types";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownSelect } from "@/components/ui/dropdown-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { BookCoverSkeletonGrid } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { useTranslation } from "@/hooks/useTranslation";
import { booksMock } from "../mocks/books.mock";
import { BookGrid } from "./BookGrid";

type BooksCatalogProps = {
  books?: Book[];
  isLoadingResults?: boolean;
};

export function BooksCatalog({ books = booksMock, isLoadingResults = false }: BooksCatalogProps) {
  const t = useTranslation();
  const [query, setQuery] = useState("");
  const [availability, setAvailability] = useState("all");
  const [visibility, setVisibility] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const filteredBooks = books.filter((book) => {
    const searchableValues = [
      book.title,
      book.author,
      book.isbn,
      book.publisher,
      book.publishedYear?.toString(),
      book.language,
      book.category,
      book.description,
      book.location?.addressLabel,
      book.location?.city,
    ].filter((value): value is string => Boolean(value));
    const matchesQuery =
      normalizedQuery.length === 0 ||
      searchableValues.some((value) => value.toLowerCase().includes(normalizedQuery));
    const matchesAvailability = availability === "all" || book.availability === availability;
    const matchesVisibility = visibility === "all" || book.visibility === visibility;

    return matchesQuery && matchesAvailability && matchesVisibility;
  });
  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedBooks = filteredBooks.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );
  const pageItems = getPaginationItems(safeCurrentPage, totalPages);
  const availabilityOptions = [
    { value: "all", label: t("books.catalog.allAvailabilitiesLabel") },
    { value: "available", label: t("books.availability.available") },
    { value: "consultation_only", label: t("books.availability.consultationOnly") },
    { value: "loanable", label: t("books.availability.loanable") },
    { value: "unavailable", label: t("books.availability.unavailable") },
  ];
  const visibilityOptions = [
    { value: "all", label: t("books.catalog.allVisibilitiesLabel") },
    { value: "public", label: t("books.visibility.public") },
    { value: "private", label: t("books.visibility.private") },
  ];
  const pageSizeOptions = [
    { value: "10", label: "10" },
    { value: "25", label: "25" },
    { value: "50", label: "50" },
  ];

  function resetPagination() {
    setCurrentPage(1);
  }

  return (
    <PageShell>
      <PageContainer size="xl">
        <PageHeader className="md:items-end">
          <PageHeaderContent>
            <PageEyebrow>{t("books.catalog.eyebrow")}</PageEyebrow>
            <PageTitle>{t("books.catalog.title")}</PageTitle>
            <PageDescription>{t("books.catalog.description")}</PageDescription>
          </PageHeaderContent>
          <ResponsiveActions>
            <Button asChild variant="secondary">
              <Link href={routes.nearby}>
                <MapPin aria-hidden="true" className="size-4" />
                {t("books.catalog.nearbyLabel")}
              </Link>
            </Button>
          </ResponsiveActions>
        </PageHeader>

        <section className="grid gap-4 rounded-xl border bg-card p-4 shadow-sm md:grid-cols-[1fr_180px_180px] md:items-end">
          <div className="space-y-2">
            <Label htmlFor="books-search">{t("books.catalog.searchLabel")}</Label>
            <Input
              id="books-search"
              onChange={(event) => {
                setQuery(event.target.value);
                resetPagination();
              }}
              placeholder={t("books.catalog.searchPlaceholder")}
              type="search"
              value={query}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="books-availability-filter">
              {t("books.catalog.availabilityFilterLabel")}
            </Label>
            <DropdownSelect
              id="books-availability-filter"
              onValueChange={(nextAvailability) => {
                setAvailability(nextAvailability);
                resetPagination();
              }}
              options={availabilityOptions}
              value={availability}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="books-visibility-filter">
              {t("books.catalog.visibilityFilterLabel")}
            </Label>
            <DropdownSelect
              id="books-visibility-filter"
              onValueChange={(nextVisibility) => {
                setVisibility(nextVisibility);
                resetPagination();
              }}
              options={visibilityOptions}
              value={visibility}
            />
          </div>
        </section>

        <div className="flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          {isLoadingResults ? (
            <span />
          ) : (
            <p>
              {filteredBooks.length} {t("books.catalog.resultsLabel")}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2" htmlFor="books-page-size">
              {t("books.catalog.pageSizeLabel")}
              <DropdownSelect
                className="h-9 w-20 px-3"
                id="books-page-size"
                onValueChange={(nextPageSize) => {
                  setPageSize(Number(nextPageSize));
                  resetPagination();
                }}
                options={pageSizeOptions}
                value={pageSize.toString()}
              />
            </label>
            {(query || availability !== "all" || visibility !== "all") && (
              <Button
                onClick={() => {
                  setQuery("");
                  setAvailability("all");
                  setVisibility("all");
                  resetPagination();
                }}
                type="button"
                variant="ghost"
              >
                {t("books.catalog.clearFiltersLabel")}
              </Button>
            )}
          </div>
        </div>

        <div className={!isLoadingResults && totalPages > 1 ? "pb-24" : undefined}>
          {isLoadingResults ? (
            <BookCoverSkeletonGrid columns={{ base: 1, md: 2, xl: 3 }} rows={2} />
          ) : (
            <BookGrid books={paginatedBooks} />
          )}
        </div>

        {!isLoadingResults && totalPages > 1 ? (
          <div className="fixed bottom-4 left-1/2 z-40 flex w-max max-w-[calc(100%-2rem)] -translate-x-1/2 justify-center rounded-lg border border-border/70 bg-background/90 px-3 py-3 shadow-2xl shadow-black/25 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
            <div className="max-w-full overflow-x-auto">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      disabled={safeCurrentPage === 1}
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    />
                  </PaginationItem>
                  {pageItems.map((item) =>
                    typeof item === "string" ? (
                      <PaginationItem key={item}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={item}>
                        <PaginationButton
                          isActive={item === safeCurrentPage}
                          onClick={() => setCurrentPage(item)}
                        >
                          {item}
                        </PaginationButton>
                      </PaginationItem>
                    ),
                  )}
                  <PaginationItem>
                    <PaginationNext
                      disabled={safeCurrentPage === totalPages}
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        ) : null}
      </PageContainer>
    </PageShell>
  );
}

function getPaginationItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis-end", totalPages] as const;
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis-start",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ] as const;
  }

  return [
    1,
    "ellipsis-start",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis-end",
    totalPages,
  ] as const;
}
