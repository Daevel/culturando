"use client";

import type { Book } from "@culturando/types";
import Link from "next/link";
import { useDeferredValue, useState } from "react";

import { Button } from "@/components/ui/button";
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
import { routes } from "@/config/routes";
import { useTranslation } from "@/hooks/useTranslation";
import { booksMock } from "../mocks/books.mock";
import { BookGrid } from "./BookGrid";

type BooksCatalogProps = {
  books?: Book[];
};

export function BooksCatalog({ books = booksMock }: BooksCatalogProps) {
  const t = useTranslation();
  const [query, setQuery] = useState("");
  const [availability, setAvailability] = useState("all");
  const [visibility, setVisibility] = useState("all");
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
              <Link href={routes.nearby}>{t("books.catalog.nearbyLabel")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.dashboard}>{t("books.catalog.dashboardLabel")}</Link>
            </Button>
            <Button asChild>
              <Link href={routes.newBook}>{t("books.catalog.newBookLabel")}</Link>
            </Button>
          </ResponsiveActions>
        </PageHeader>

        <section className="grid gap-4 rounded-xl border bg-card p-4 shadow-sm md:grid-cols-[1fr_180px_180px] md:items-end">
          <div className="space-y-2">
            <Label htmlFor="books-search">{t("books.catalog.searchLabel")}</Label>
            <Input
              id="books-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("books.catalog.searchPlaceholder")}
              type="search"
              value={query}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="books-availability-filter">
              {t("books.catalog.availabilityFilterLabel")}
            </Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              id="books-availability-filter"
              onChange={(event) => setAvailability(event.target.value)}
              value={availability}
            >
              <option value="all">{t("books.catalog.allAvailabilitiesLabel")}</option>
              <option value="available">{t("books.availability.available")}</option>
              <option value="consultation_only">{t("books.availability.consultationOnly")}</option>
              <option value="loanable">{t("books.availability.loanable")}</option>
              <option value="unavailable">{t("books.availability.unavailable")}</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="books-visibility-filter">
              {t("books.catalog.visibilityFilterLabel")}
            </Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              id="books-visibility-filter"
              onChange={(event) => setVisibility(event.target.value)}
              value={visibility}
            >
              <option value="all">{t("books.catalog.allVisibilitiesLabel")}</option>
              <option value="public">{t("books.visibility.public")}</option>
              <option value="private">{t("books.visibility.private")}</option>
            </select>
          </div>
        </section>

        <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>
            {filteredBooks.length} {t("books.catalog.resultsLabel")}
          </p>
          {(query || availability !== "all" || visibility !== "all") && (
            <Button
              onClick={() => {
                setQuery("");
                setAvailability("all");
                setVisibility("all");
              }}
              type="button"
              variant="ghost"
            >
              {t("books.catalog.clearFiltersLabel")}
            </Button>
          )}
        </div>

        <BookGrid books={filteredBooks} />
      </PageContainer>
    </PageShell>
  );
}
