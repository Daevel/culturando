import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/config/routes";
import { useTranslation } from "@/hooks/useTranslation";
import { BookForm } from "./BookForm";

export function NewBookPlaceholder() {
  const t = useTranslation();

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <p className="text-sm font-medium text-muted-foreground">{t("books.new.eyebrow")}</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t("books.new.title")}</h1>
          <p className="text-muted-foreground">{t("books.new.description")}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="outline">
              <Link href={routes.dashboard}>{t("books.new.backToDashboardLabel")}</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={routes.books}>{t("books.new.backToCatalogLabel")}</Link>
            </Button>
          </div>
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
    </main>
  );
}
