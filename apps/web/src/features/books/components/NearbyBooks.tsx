import type { Book } from "@culturando/types";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/config/routes";
import type { NearbyBook } from "@/features/books/actions/books.repository";
import { NearbyMap, type NearbyMapPoint } from "@/features/books/components/NearbyMap";
import { useTranslation } from "@/hooks/useTranslation";

type NearbyBooksProps = {
  originBook: Book;
  books: NearbyBook[];
};

export function NearbyBooks({ originBook, books }: NearbyBooksProps) {
  const t = useTranslation();
  const mapPoints = getMapPoints(originBook, books);

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <section className="mx-auto flex max-w-4xl flex-col gap-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">{t("books.nearby.eyebrow")}</p>
            <h1 className="max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
              {t("books.nearby.title")}
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              {t("books.nearby.description")}{" "}
              <span className="font-medium">{originBook.title}</span>
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={routes.books}>{t("books.detail.backToCatalogLabel")}</Link>
          </Button>
        </div>

        <NearbyMap
          description={t("books.nearby.mapDescription")}
          emptyState={t("books.nearby.mapEmptyState")}
          legendNearbyLabel={t("maps.legend.nearbyLabel")}
          legendOriginLabel={t("maps.legend.originLabel")}
          pauseRotationLabel={t("maps.controls.pauseRotationLabel")}
          points={mapPoints}
          resetCameraLabel={t("maps.controls.resetCameraLabel")}
          resumeRotationLabel={t("maps.controls.resumeRotationLabel")}
          switchTo2dLabel={t("maps.controls.switchTo2dLabel")}
          switchTo3dLabel={t("maps.controls.switchTo3dLabel")}
          title={t("books.nearby.mapTitle")}
        />

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
                    <p>
                      {book.location
                        ? [book.location.city, book.location.province, book.location.region]
                            .filter(Boolean)
                            .join(", ") || book.location.country
                        : t("books.detail.emptyValue")}
                    </p>
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
              {t("books.nearby.emptyState")}
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
}

function getMapPoints(originBook: Book, books: NearbyBook[]): NearbyMapPoint[] {
  const originLatitude = originBook.location?.publicLatitude;
  const originLongitude = originBook.location?.publicLongitude;

  if (originLatitude === undefined || originLongitude === undefined) {
    return [];
  }

  return [
    {
      id: originBook.id,
      title: originBook.title,
      subtitle: originBook.author,
      latitude: originLatitude,
      longitude: originLongitude,
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
          subtitle: `${book.author} · ${formatDistance(distanceKm)}`,
          latitude,
          longitude,
          variant: "nearby" as const,
        },
      ];
    }),
  ];
}

function formatDistance(distanceKm: number) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toFixed(1)} km`;
}
