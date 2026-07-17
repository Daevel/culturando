import { geocodeAddress } from "@culturando/geo";
import { redirect } from "next/navigation";

import { auth } from "@/config/auth";
import { routes } from "@/config/routes";
import { getNearbyBooksByCoordinates } from "@/features/books/actions/books.repository";
import { NearbySearchPage } from "@/features/nearby/components/NearbySearchPage";

type NearbyPageProps = {
  searchParams: Promise<{
    q?: string;
    radius?: string;
  }>;
};

const defaultRadiusKm = 25;
const allowedRadiusKm = [5, 10, 25, 50] as const;

export const dynamic = "force-dynamic";

export default async function NearbyPage({ searchParams }: NearbyPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect(routes.login);
  }

  const { q, radius } = await searchParams;
  const query = q?.trim() ?? "";
  const radiusKm = parseRadiusKm(radius);

  if (!query) {
    return <NearbySearchPage books={[]} query="" radiusKm={radiusKm} />;
  }

  const geocodingResult = await geocodeAddress({
    addressLabel: query,
    country: "Italia",
  });

  if (!geocodingResult) {
    return <NearbySearchPage books={[]} geocodingFailed query={query} radiusKm={radiusKm} />;
  }

  const books = await getNearbyBooksByCoordinates({
    latitude: geocodingResult.publicCoordinates.latitude,
    longitude: geocodingResult.publicCoordinates.longitude,
    radiusKm,
  });

  return (
    <NearbySearchPage
      books={books}
      origin={{
        latitude: geocodingResult.publicCoordinates.latitude,
        longitude: geocodingResult.publicCoordinates.longitude,
        title: query,
      }}
      query={query}
      radiusKm={radiusKm}
    />
  );
}

function parseRadiusKm(value: string | undefined) {
  const radius = Number(value);

  return allowedRadiusKm.includes(radius as (typeof allowedRadiusKm)[number])
    ? radius
    : defaultRadiusKm;
}
