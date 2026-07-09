import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PageDescription,
  PageEyebrow,
  PageShell,
  PageTitle,
  ResponsiveActions,
} from "@/components/ui/page";
import { routes } from "@/config/routes";
import { useTranslation } from "@/hooks/useTranslation";
import { BookForm } from "./BookForm";

export function NewBookPlaceholder() {
  const t = useTranslation();

  return (
    <PageShell>
      <section className="mx-auto grid w-full max-w-5xl gap-[var(--section-gap)] lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="space-y-4">
          <PageEyebrow>{t("books.new.eyebrow")}</PageEyebrow>
          <PageTitle className="lg:text-4xl">{t("books.new.title")}</PageTitle>
          <PageDescription>{t("books.new.description")}</PageDescription>
          <ResponsiveActions>
            <Button asChild variant="outline">
              <Link href={routes.dashboard}>{t("books.new.backToDashboardLabel")}</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={routes.books}>{t("books.new.backToCatalogLabel")}</Link>
            </Button>
          </ResponsiveActions>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("books.new.formTitle")}</CardTitle>
            <CardDescription>{t("books.new.formDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <BookForm />
          </CardContent>
        </Card>
      </section>
    </PageShell>
  );
}
