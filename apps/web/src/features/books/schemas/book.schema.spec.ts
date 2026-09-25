import { describe, expect, it } from "vitest";

import { bookSchema, validateBookForm } from "./book.schema";

const validInput = {
  title: "Il nome della rosa",
  author: "Umberto Eco",
  isbn: "978-88-452-9259-1",
  publisher: "Bompiani",
  publishedYear: "1980",
  language: "Italiano",
  category: "Romanzo",
  description: "Un giallo medievale.",
  availability: "loanable",
  visibility: "public",
  physicalCondition: "good",
  addressLabel: "Via Toledo 1",
  city: "Napoli",
  province: "NA",
  region: "Campania",
  country: "Italia",
  imageUrls: "https://example.com/cover.jpg",
  externalCoverUrl: "https://example.com/external.jpg",
};

const requiredFields = [
  "title",
  "isbn",
  "availability",
  "visibility",
  "physicalCondition",
  "addressLabel",
  "city",
  "province",
  "region",
  "country",
] as const;

const optionalTextFields = [
  "author",
  "publisher",
  "language",
  "category",
  "description",
  "imageUrls",
  "externalCoverUrl",
] as const;

describe("bookSchema", () => {
  it("accepts a valid input", () => {
    const result = validateBookForm(validInput);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("normalizes the ISBN by removing dashes and spaces", () => {
    expect(bookSchema.parse({ ...validInput, isbn: " 978 88-452 9259-1 " }).isbn).toBe(
      "9788845292591",
    );
  });

  it("converts publishedYear to a number", () => {
    expect(bookSchema.parse(validInput).publishedYear).toBe(1980);
  });

  it.each(requiredFields)("rejects a missing required field (%s)", (field) => {
    const { [field]: _omitted, ...input } = validInput;
    const result = validateBookForm(input);

    expect(result.isValid).toBe(false);
    expect(result.data).toBeNull();
    expect(result.errors).toHaveProperty(field);
  });

  it.each([
    "title",
    "isbn",
    "addressLabel",
    "city",
    "province",
    "region",
    "country",
  ] as const)("rejects a whitespace-only %s", (field) => {
    const result = validateBookForm({ ...validInput, [field]: "   " });

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty(field);
  });

  it("rejects an ISBN made only of separators", () => {
    const result = validateBookForm({ ...validInput, isbn: "- -" });

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty(
      "isbn",
      expect.arrayContaining(["L'ISBN è obbligatorio."]),
    );
  });

  it.each(optionalTextFields)("turns an empty optional %s into undefined", (field) => {
    const result = bookSchema.parse({ ...validInput, [field]: "   " });

    expect(result[field]).toBeUndefined();
  });

  it("accepts missing optional fields", () => {
    const input = Object.fromEntries(
      Object.entries(validInput).filter(
        ([key]) =>
          !(optionalTextFields as readonly string[]).includes(key) && key !== "publishedYear",
      ),
    );

    const result = validateBookForm(input);

    expect(result.isValid).toBe(true);
    expect(result.data?.publishedYear).toBeUndefined();
  });

  it.each([
    ["title", 181],
    ["author", 141],
    ["isbn", 21],
    ["publisher", 121],
    ["language", 41],
    ["category", 81],
    ["description", 601],
    ["addressLabel", 181],
    ["city", 81],
    ["province", 81],
    ["region", 81],
    ["country", 81],
    ["imageUrls", 1001],
    ["externalCoverUrl", 301],
  ] as const)("rejects a %s longer than its limit (%i chars)", (field, length) => {
    const result = validateBookForm({ ...validInput, [field]: "1".repeat(length) });

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty(field);
  });

  it("accepts a description of exactly 600 characters", () => {
    expect(validateBookForm({ ...validInput, description: "a".repeat(600) }).isValid).toBe(true);
  });

  it.each(["1000", "2100", ""])("accepts publishedYear %j", (publishedYear) => {
    expect(validateBookForm({ ...validInput, publishedYear }).isValid).toBe(true);
  });

  it.each([
    ["non-numeric", "19a0", "L'anno di pubblicazione deve contenere solo numeri."],
    ["negative", "-1980", "L'anno di pubblicazione deve contenere solo numeri."],
    ["decimal", "1980.5", "L'anno di pubblicazione deve contenere solo numeri."],
    ["below 1000", "999", "Inserisci un anno valido."],
    ["above 2100", "2101", "Inserisci un anno valido."],
  ])("rejects a %s publishedYear", (_label, publishedYear, message) => {
    const result = validateBookForm({ ...validInput, publishedYear });

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty("publishedYear", expect.arrayContaining([message]));
  });

  it.each([
    ["availability", "sold"],
    ["visibility", "friends"],
    ["physicalCondition", "broken"],
  ])("rejects an invalid %s enum value", (field, value) => {
    const result = validateBookForm({ ...validInput, [field]: value });

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty(field);
  });
});
