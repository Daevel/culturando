"use server";

import { searchAddressSuggestions as searchGeoAddressSuggestions } from "@culturando/geo";

export async function searchAddressSuggestions(query: string) {
  return searchGeoAddressSuggestions(query);
}
