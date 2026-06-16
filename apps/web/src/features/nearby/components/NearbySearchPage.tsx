import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { routes } from "@/config/routes";
import type { NearbyBook } from "@/features/books/actions/books.repository";
import { NearbyMap, type NearbyMapPoint } from "@/features/books/components/NearbyMap";
import { useTranslation } from "@/hooks/useTranslation";

type NearbySearchOrigin = {
  title: string;
  latitude: number;
  longitude: number;
};

type NearbySearchPageProps = {
  query: string;
  books: NearbyBook[];
  radiusKm: number;
  origin?: NearbySearchOrigin;
  geocodingFailed?: boolean;
};

export function NearbySearchPage({
  query,
  books,
  radiusKm,
  origin,
  geocodingFailed = false,
}: NearbySearchPageProps) {
  const t = useTranslation();
  const mapPoints = origin ? getMapPoints(origin, books, t("nearby.search.originLabel")) : [];
  const hasSearched = query.length > 0;

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <section className="mx-auto flex max-w-5xl flex-col gap-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              {t("nearby.search.eyebrow")}
            </p>
            <h1 className="max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
              {t("nearby.search.title")}
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              {t("nearby.search.description")}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={routes.books}>{t("books.detail.backToCatalogLabel")}</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("nearby.search.formTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={routes.nearby}
              className="grid gap-4 md:grid-cols-[1fr_180px_auto] md:items-end"
            >
              <div className="space-y-2">
                <Label htmlFor="nearby-query">{t("nearby.search.queryLabel")}</Label>
                <Input
                  defaultValue={query}
                  id="nearby-query"
                  name="q"
                  placeholder={t("nearby.search.queryPlaceholder")}
                  type="search"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nearby-radius">{t("nearby.search.radiusLabel")}</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  defaultValue={radiusKm.toString()}
                  id="nearby-radius"
                  name="radius"
                >
                  <option value="5">{t("nearby.search.radius5Label")}</option>
                  <option value="10">{t("nearby.search.radius10Label")}</option>
                  <option value="25">{t("nearby.search.radius25Label")}</option>
                  <option value="50">{t("nearby.search.radius50Label")}</option>
                </select>
              </div>
              <Button type="submit">{t("nearby.search.submitLabel")}</Button>
            </form>
          </CardContent>
        </Card>

        {geocodingFailed ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {t("nearby.search.geocodingFailedMessage")}
            </CardContent>
          </Card>
        ) : null}

        {origin ? (
          <NearbyMap
            description={t("nearby.search.mapDescription")}
            emptyState={t("nearby.search.mapEmptyState")}
            legendNearbyLabel={t("maps.legend.nearbyLabel")}
            legendOriginLabel={t("maps.legend.originLabel")}
            pauseRotationLabel={t("maps.controls.pauseRotationLabel")}
            points={mapPoints}
            resetCameraLabel={t("maps.controls.resetCameraLabel")}
            resumeRotationLabel={t("maps.controls.resumeRotationLabel")}
            switchTo2dLabel={t("maps.controls.switchTo2dLabel")}
            switchTo3dLabel={t("maps.controls.switchTo3dLabel")}
            title={t("nearby.search.mapTitle")}
          />
        ) : null}

        {hasSearched && !geocodingFailed ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
              <p>
                {books.length} {t("nearby.search.resultsLabel")}
              </p>
              {origin ? <Badge variant="secondary">{origin.title}</Badge> : null}
            </div>

            {books.length > 0 ? (
              <div className="grid gap-4">
                {books.map(({ book, distanceKm }) => (
                  <Card key={book.id}>
                    <CardHeader className="gap-y-3">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div>
                          <CardTitle className="text-xl">
                            <Link className="hover:text-primary" href={routes.bookDetail(book.id)}>
                              {book.title}
                            </Link>
                          </CardTitle>
                          <p className="mt-1 text-sm font-medium text-muted-foreground">
                            {book.author}
                          </p>
                        </div>
                        <Badge>{formatDistance(distanceKm)}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>{book.description ?? t("books.card.emptyDescription")}</p>
                        <p>{formatArea(book) || t("books.detail.emptyValue")}</p>
                      </div>
                      <Button asChild variant="secondary">
                        <Link href={routes.bookDetail(book.id)}>{t("books.card.detailLabel")}</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  {t("nearby.search.emptyState")}
                </CardContent>
              </Card>
            )}
          </section>
        ) : null}
      </section>
    </main>
  );
}

function getMapPoints(
  origin: NearbySearchOrigin,
  books: NearbyBook[],
  originLabel: string,
): NearbyMapPoint[] {
  return [
    {
      id: "nearby-search-origin",
      title: origin.title,
      subtitle: originLabel,
      latitude: origin.latitude,
      longitude: origin.longitude,
      variant: "origin",
    },
    ...books.flatMap(({ book, distanceKm }) => {
      const latitude = book.location?.publicLatitude;
      const longitude = book.location?.publicLongitude;

      if (latitude === undefined || longitude === undefined) {
        return [];
      }

      return [
        {
          id: book.id,
          title: book.title,
          subtitle: `${book.author} - ${formatDistance(distanceKm)}`,
          latitude,
          longitude,
          variant: "nearby" as const,
        },
      ];
    }),
  ];
}

function formatArea({ location }: NearbyBook["book"]) {
  if (!location) {
    return "";
  }

  return (
    [location.city, location.province, location.region].filter(Boolean).join(", ") ||
    location.country
  );
}

function formatDistance(distanceKm: number) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toFixed(1)} km`;
}
