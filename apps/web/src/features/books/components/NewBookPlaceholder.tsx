"use client";

import { PageDescription, PageEyebrow, PageShell, PageTitle } from "@/components/ui/page";
import { useTranslation } from "@/hooks/useTranslation";
import { BookForm } from "./BookForm";

export function NewBookPlaceholder() {
  const t = useTranslation();

  return (
    <PageShell>
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-[var(--section-gap)]">
        <div className="space-y-4">
          <PageEyebrow>{t("books.new.eyebrow")}</PageEyebrow>
          <PageTitle className="lg:text-4xl">{t("books.new.title")}</PageTitle>
          <PageDescription>{t("books.new.description")}</PageDescription>
        </div>

        <BookForm />
      </section>
    </PageShell>
  );
}
