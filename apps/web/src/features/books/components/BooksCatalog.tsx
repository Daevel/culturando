"use client";

import type { Book } from "@culturando/types";
import Link from "next/link";
import { useDeferredValue, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [status, setStatus] = useState("all");
  const [visibility, setVisibility] = useState("all");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const filteredBooks = books.filter((book) => {
    const searchableValues = [
      book.title,
      book.author,
      book.isbn,
      book.publisher,
      book.publicationYear?.toString(),
      book.language,
      book.description,
    ].filter((value): value is string => Boolean(value));
    const matchesQuery =
      normalizedQuery.length === 0 ||
      searchableValues.some((value) => value.toLowerCase().includes(normalizedQuery));
    const matchesStatus = status === "all" || book.status === status;
    const matchesVisibility = visibility === "all" || book.visibility === visibility;

    return matchesQuery && matchesStatus && matchesVisibility;
  });

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
            <Label htmlFor="books-status-filter">{t("books.catalog.statusFilterLabel")}</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              id="books-status-filter"
              onChange={(event) => setStatus(event.target.value)}
              value={status}
            >
              <option value="all">{t("books.catalog.allStatusesLabel")}</option>
              <option value="available">{t("books.status.available")}</option>
              <option value="reserved">{t("books.status.reserved")}</option>
              <option value="unavailable">{t("books.status.unavailable")}</option>
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
          {(query || status !== "all" || visibility !== "all") && (
            <Button
              onClick={() => {
                setQuery("");
                setStatus("all");
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
      </section>
    </main>
  );
}
