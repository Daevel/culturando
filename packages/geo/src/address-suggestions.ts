import { formatStructuredAddress } from "./geocoding";

const geoapifyAutocompleteUrl = "https://api.geoapify.com/v1/geocode/autocomplete";
const nominatimSearchUrl = "https://nominatim.openstreetmap.org/search";
const minAddressQueryLength = 3;
const defaultLimit = 6;

const requestHeaders = {
  Accept: "application/json",
  "Accept-Language": "it,en;q=0.8",
  "User-Agent": "Culturando/0.1 (https://github.com/Daevel/culturando)",
};

export type AddressSuggestion = {
  addressLabel: string;
  city: string;
  displayName: string;
  id: string;
  postalCode: string;
  provider: "geoapify" | "nominatim";
  province: string;
  region: string;
};

type GeoapifyAutocompleteResult = {
  features?: GeoapifyFeature[];
};

type GeoapifyFeature = {
  properties?: {
    address_line1?: string;
    address_line2?: string;
    city?: string;
    county?: string;
    formatted?: string;
    housenumber?: string;
    place_id?: string;
    postcode?: string;
    state?: string;
    street?: string;
  };
};

type NominatimAddress = {
  city?: string;
  county?: string;
  house_number?: string;
  municipality?: string;
  postcode?: string;
  region?: string;
  road?: string;
  state?: string;
  town?: string;
  village?: string;
};

type NominatimSearchResult = {
  address?: NominatimAddress;
  display_name?: string;
  place_id: number;
};

export async function searchAddressSuggestions(query: string): Promise<AddressSuggestion[]> {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < minAddressQueryLength) {
    return [];
  }

  const geoapifySuggestions = await searchGeoapifyAddressSuggestions(normalizedQuery);

  if (geoapifySuggestions.length > 0) {
    return geoapifySuggestions;
  }

  return searchNominatimAddressSuggestions(normalizedQuery);
}

async function searchGeoapifyAddressSuggestions(query: string): Promise<AddressSuggestion[]> {
  const apiKey = process.env.GEOAPIFY_API_KEY?.trim();

  if (!apiKey) {
    return [];
  }

  const url = new URL(geoapifyAutocompleteUrl);
  url.searchParams.set("text", query);
  url.searchParams.set("filter", "countrycode:it");
  url.searchParams.set("lang", "it");
  url.searchParams.set("limit", String(defaultLimit));
  url.searchParams.set("apiKey", apiKey);

  try {
    const response = await fetch(url, { cache: "no-store", headers: requestHeaders });

    if (!response.ok) {
      return [];
    }

    const results = (await response.json()) as GeoapifyAutocompleteResult;

    return (results.features ?? [])
      .map(toGeoapifyAddressSuggestion)
      .filter((suggestion) => suggestion !== undefined);
  } catch {
    return [];
  }
}

function toGeoapifyAddressSuggestion(feature: GeoapifyFeature): AddressSuggestion | undefined {
  const properties = feature.properties;

  if (!properties) {
    return undefined;
  }

  const city = properties.city ?? "";
  const province = properties.county ?? "";
  const region = properties.state ?? "";
  const displayName =
    properties.formatted?.trim() ||
    [properties.address_line1, properties.address_line2].filter(Boolean).join(", ");
  const addressLabel = formatStructuredAddress({
    city,
    fallback: properties.formatted ?? properties.address_line1,
    houseNumber: properties.housenumber,
    province,
    street: properties.street,
  });

  if (!displayName || !addressLabel) {
    return undefined;
  }

  return {
    addressLabel,
    city,
    displayName,
    id: properties.place_id ?? displayName,
    postalCode: properties.postcode ?? "",
    provider: "geoapify",
    province,
    region,
  };
}

async function searchNominatimAddressSuggestions(query: string): Promise<AddressSuggestion[]> {
  const url = new URL(nominatimSearchUrl);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("countrycodes", "it");
  url.searchParams.set("limit", String(defaultLimit));
  url.searchParams.set("q", query);

  try {
    const response = await fetch(url, { cache: "no-store", headers: requestHeaders });

    if (!response.ok) {
      return [];
    }

    const results = (await response.json()) as NominatimSearchResult[];

    return results
      .map(toNominatimAddressSuggestion)
      .filter((suggestion) => suggestion !== undefined);
  } catch {
    return [];
  }
}

function toNominatimAddressSuggestion(
  result: NominatimSearchResult,
): AddressSuggestion | undefined {
  const address = result.address;
  const displayName = result.display_name?.trim();

  if (!address || !displayName) {
    return undefined;
  }

  const city = address.city ?? address.town ?? address.village ?? address.municipality ?? "";
  const province = address.county ?? "";
  const region = address.state ?? address.region ?? "";
  const addressLabel = formatStructuredAddress({
    city,
    fallback: displayName,
    houseNumber: address.house_number,
    province,
    street: address.road,
  });

  return {
    addressLabel,
    city,
    displayName,
    id: String(result.place_id),
    postalCode: address.postcode ?? "",
    provider: "nominatim",
    province,
    region,
  };
}
