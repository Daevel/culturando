import type { Coordinates } from "@culturando/types";

import { approximateCoordinates, normalizeCoordinates } from "./coordinates";

const nominatimSearchUrl = "https://nominatim.openstreetmap.org/search";
const defaultAccuracyRadiusMeters = 750;
const requestHeaders = {
  Accept: "application/json",
  "Accept-Language": "it,en;q=0.8",
  "User-Agent": "Culturando/0.1 (https://github.com/Daevel/culturando)",
};

export type GeocodingAddress = {
  addressLabel: string;
  city?: string;
  province?: string;
  region?: string;
  country: string;
};

export type GeocodingResult = {
  coordinates: Coordinates;
  publicCoordinates: Coordinates;
  accuracyRadiusMeters: number;
  provider: "nominatim";
};

type NominatimSearchResult = {
  lat?: string;
  lon?: string;
};

export async function geocodeAddress(address: GeocodingAddress): Promise<GeocodingResult | null> {
  const urls = createNominatimUrls(address);

  if (urls.length === 0) {
    return null;
  }

  for (const url of urls) {
    const result = await fetchNominatimResult(url);

    if (result) {
      return result;
    }
  }

  return null;
}

export function formatAddressQuery(address: GeocodingAddress) {
  return [address.addressLabel, address.city, address.province, address.region, address.country]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");
}

function createNominatimUrls(address: GeocodingAddress) {
  const urls: URL[] = [];
  const query = formatAddressQuery(address);

  if (query) {
    const freeTextUrl = createBaseNominatimUrl();

    freeTextUrl.searchParams.set("q", query);
    urls.push(freeTextUrl);
  }

  const structuredUrl = createBaseNominatimUrl();
  structuredUrl.searchParams.set("street", address.addressLabel);

  if (address.city) {
    structuredUrl.searchParams.set("city", address.city);
  }

  if (address.province) {
    structuredUrl.searchParams.set("county", address.province);
  }

  if (address.region) {
    structuredUrl.searchParams.set("state", address.region);
  }

  structuredUrl.searchParams.set("country", address.country);
  urls.push(structuredUrl);

  return urls;
}

function createBaseNominatimUrl() {
  const url = new URL(nominatimSearchUrl);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "0");
  url.searchParams.set("countrycodes", "it");

  return url;
}

async function fetchNominatimResult(url: URL): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: requestHeaders,
    });

    if (!response.ok) {
      return null;
    }

    const results = (await response.json()) as NominatimSearchResult[];
    const result = results[0];

    if (!result?.lat || !result.lon) {
      return null;
    }

    const coordinates = normalizeCoordinates({
      latitude: Number(result.lat),
      longitude: Number(result.lon),
    });

    if (!coordinates) {
      return null;
    }

    const publicCoordinates = approximateCoordinates(coordinates);

    if (!publicCoordinates) {
      return null;
    }

    return {
      coordinates,
      publicCoordinates,
      accuracyRadiusMeters: defaultAccuracyRadiusMeters,
      provider: "nominatim",
    };
  } catch {
    return null;
  }
}
