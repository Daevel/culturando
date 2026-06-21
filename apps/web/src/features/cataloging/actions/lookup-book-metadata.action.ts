"use server";

import { lookupBookMetadataByIsbn, type BookMetadataSuggestion } from "@culturando/ai";

export type LookupBookMetadataResult =
  | {
      success: true;
      metadata: BookMetadataSuggestion;
    }
  | {
      success: false;
      reason: "missing-isbn" | "not-found" | "error";
    };

export async function lookupBookMetadataAction(isbn: string): Promise<LookupBookMetadataResult> {
  const normalizedIsbn = isbn.replace(/[-\s]/g, "").trim();

  if (!normalizedIsbn) {
    return {
      success: false,
      reason: "missing-isbn",
    };
  }

  try {
    const metadata = await lookupBookMetadataByIsbn(normalizedIsbn);

    if (!metadata) {
      return {
        success: false,
        reason: "not-found",
      };
    }

    return {
      success: true,
      metadata,
    };
  } catch {
    return {
      success: false,
      reason: "error",
    };
  }
}
