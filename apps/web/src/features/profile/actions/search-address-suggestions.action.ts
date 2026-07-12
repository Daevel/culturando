"use server";

const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";
const MIN_ADDRESS_QUERY_LENGTH = 3;

const requestHeaders = {
  Accept: "application/json",
  "Accept-Language": "it,en;q=0.8",
  "User-Agent": "Culturando/0.1 (https://github.com/Daevel/culturando)",
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

export type AddressSuggestion = {
  addressLabel: string;
  city: string;
  displayName: string;
  id: string;
  postalCode: string;
  province: string;
  region: string;
};

export async function searchAddressSuggestions(query: string): Promise<AddressSuggestion[]> {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < MIN_ADDRESS_QUERY_LENGTH) {
    return [];
  }

  const url = new URL(NOMINATIM_SEARCH_URL);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("countrycodes", "it");
  url.searchParams.set("limit", "6");
  url.searchParams.set("q", normalizedQuery);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: requestHeaders,
    });

    if (!response.ok) {
      return [];
    }

    const results = (await response.json()) as NominatimSearchResult[];

    return results.map(toAddressSuggestion).filter((suggestion) => suggestion !== undefined);
  } catch {
    return [];
  }
}

function toAddressSuggestion(result: NominatimSearchResult): AddressSuggestion | undefined {
  const address = result.address;
  const displayName = result.display_name?.trim();

  if (!address || !displayName) {
    return undefined;
  }

  return {
    addressLabel: formatAddressLabel(address, displayName),
    city: address.city ?? address.town ?? address.village ?? address.municipality ?? "",
    displayName,
    id: String(result.place_id),
    postalCode: address.postcode ?? "",
    province: address.county ?? "",
    region: address.state ?? address.region ?? "",
  };
}

function formatAddressLabel(address: NominatimAddress, fallback: string) {
  const streetAddress = [address.road, address.house_number].filter(Boolean).join(" ");

  return streetAddress || fallback;
}
