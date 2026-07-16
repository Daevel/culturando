"use client";

import {
  PageContainer,
  PageDescription,
  PageEyebrow,
  PageShell,
  PageTitle,
} from "@/components/ui/page";
import { useTranslation } from "@/hooks/useTranslation";
import { BookForm } from "./BookForm";

export function NewBookPlaceholder() {
  const t = useTranslation();

  return (
    <PageShell>
      <PageContainer>
        <div className="space-y-4">
          <PageEyebrow>{t("books.new.eyebrow")}</PageEyebrow>
          <PageTitle>{t("books.new.title")}</PageTitle>
          <PageDescription>{t("books.new.description")}</PageDescription>
        </div>

        <BookForm />
      </PageContainer>
    </PageShell>
  );
}
