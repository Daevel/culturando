import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { routes } from "@/config/routes";
import { useTranslation } from "@/hooks/useTranslation";

export function HomePageContent() {
  const t = useTranslation();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-20 text-center">
        <Badge variant="secondary">{t("home.hero.eyebrow")}</Badge>

        <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
          {t("home.hero.title")}
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          {t("home.hero.description")}
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg">
            <Link href={routes.books}>{t("home.hero.primaryActionLabel")}</Link>
          </Button>

          <Button asChild size="lg" variant="secondary">
            <Link href={routes.nearby}>{t("home.hero.nearbyActionLabel")}</Link>
          </Button>

          <Button asChild size="lg" variant="outline">
            <Link href={routes.newBook}>{t("home.hero.secondaryActionLabel")}</Link>
          </Button>
        </div>

        <div className="mt-16 grid w-full gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold">{t("home.highlights.map.title")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("home.highlights.map.description")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold">{t("home.highlights.cataloging.title")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("home.highlights.cataloging.description")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold">{t("home.highlights.privacy.title")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("home.highlights.privacy.description")}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
