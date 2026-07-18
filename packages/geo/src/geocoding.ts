import type { Coordinates } from "@culturando/types";

import { approximateCoordinates, normalizeCoordinates } from "./coordinates";

const nominatimSearchUrl = "https://nominatim.openstreetmap.org/search";
const geoapifySearchUrl = "https://api.geoapify.com/v1/geocode/search";
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
  provider: "geoapify" | "nominatim";
};

type GeoapifySearchResult = {
  features?: Array<{
    geometry?: {
      coordinates?: [number, number];
    };
    properties?: {
      lat?: number;
      lon?: number;
    };
  }>;
};

type NominatimSearchResult = {
  lat?: string;
  lon?: string;
};

export async function geocodeAddress(address: GeocodingAddress): Promise<GeocodingResult | null> {
  const geoapifyResult = await fetchGeoapifyResult(address);

  if (geoapifyResult) {
    return geoapifyResult;
  }

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

export function formatStructuredAddress({
  city,
  fallback,
  houseNumber,
  province,
  street,
}: {
  city?: string;
  fallback?: string;
  houseNumber?: string;
  province?: string;
  street?: string;
}) {
  const streetLine = [street, houseNumber]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
  const addressLabel = [streetLine, city?.trim(), province?.trim()].filter(Boolean).join(", ");

  return addressLabel || fallback?.trim() || "";
}

async function fetchGeoapifyResult(address: GeocodingAddress): Promise<GeocodingResult | null> {
  const apiKey = process.env.GEOAPIFY_API_KEY?.trim();
  const query = formatAddressQuery(address);

  if (!apiKey || !query) {
    return null;
  }

  const url = new URL(geoapifySearchUrl);
  url.searchParams.set("text", query);
  url.searchParams.set("filter", "countrycode:it");
  url.searchParams.set("lang", "it");
  url.searchParams.set("limit", "1");
  url.searchParams.set("apiKey", apiKey);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: requestHeaders,
    });

    if (!response.ok) {
      return null;
    }

    const result = (await response.json()) as GeoapifySearchResult;
    const feature = result.features?.[0];
    const longitude = feature?.properties?.lon ?? feature?.geometry?.coordinates?.[0];
    const latitude = feature?.properties?.lat ?? feature?.geometry?.coordinates?.[1];

    if (latitude === undefined || longitude === undefined) {
      return null;
    }

    return createGeocodingResult({ latitude, longitude }, "geoapify");
  } catch {
    return null;
  }
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

    return createGeocodingResult(
      {
        latitude: Number(result.lat),
        longitude: Number(result.lon),
      },
      "nominatim",
    );
  } catch {
    return null;
  }
}

function createGeocodingResult(
  coordinatesInput: Coordinates,
  provider: GeocodingResult["provider"],
): GeocodingResult | null {
  const coordinates = normalizeCoordinates(coordinatesInput);

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
    provider,
  };
}
