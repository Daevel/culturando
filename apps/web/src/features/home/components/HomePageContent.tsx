import Link from "next/link";

import { BrandLogo } from "@/components/BrandLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageDescription, PageShell, PageTitle, ResponsiveActions } from "@/components/ui/page";
import { routes } from "@/config/routes";
import { useTranslation } from "@/hooks/useTranslation";

export function HomePageContent() {
  const t = useTranslation();

  return (
    <PageShell className="flex items-center">
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center py-8 text-center sm:py-12 lg:min-h-[calc(100vh-8rem)]">
        <BrandLogo className="mb-8 h-16 w-64 sm:h-20 sm:w-80" priority />

        <Badge variant="secondary">{t("home.hero.eyebrow")}</Badge>

        <PageTitle className="mt-6 max-w-4xl text-4xl sm:text-5xl lg:text-6xl">
          {t("home.hero.title")}
        </PageTitle>

        <PageDescription className="mt-6">{t("home.hero.description")}</PageDescription>

        <ResponsiveActions className="mt-10 justify-center">
          <Button asChild size="lg">
            <Link href={routes.books}>{t("home.hero.primaryActionLabel")}</Link>
          </Button>

          <Button asChild size="lg" variant="secondary">
            <Link href={routes.nearby}>{t("home.hero.nearbyActionLabel")}</Link>
          </Button>

          <Button asChild size="lg" variant="outline">
            <Link href={routes.newBook}>{t("home.hero.secondaryActionLabel")}</Link>
          </Button>
        </ResponsiveActions>

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
    </PageShell>
  );
}
