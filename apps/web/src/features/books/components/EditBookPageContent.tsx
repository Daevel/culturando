"use client";

import type { Book } from "@culturando/types";
import {
  PageContainer,
  PageDescription,
  PageEyebrow,
  PageShell,
  PageTitle,
} from "@/components/ui/page";
import { useTranslation } from "@/hooks/useTranslation";
import type { BookFormState } from "../types/book-form.types";
import { BookForm } from "./BookForm";

type EditBookPageContentProps = {
  action: (state: BookFormState, formData: FormData) => Promise<BookFormState>;
  book: Book;
};

export function EditBookPageContent({ action, book }: EditBookPageContentProps) {
  const t = useTranslation();

  return (
    <PageShell>
      <PageContainer>
        <div className="space-y-4">
          <PageEyebrow>{t("books.edit.eyebrow")}</PageEyebrow>
          <PageTitle>{t("books.edit.title")}</PageTitle>
          <PageDescription>{t("books.edit.description")}</PageDescription>
        </div>

        <BookForm action={action} book={book} mode="edit" />
      </PageContainer>
    </PageShell>
  );
}
