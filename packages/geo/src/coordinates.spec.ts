import type { Coordinates } from "@culturando/types";
import { describe, expect, it } from "vitest";

import { approximateCoordinates, normalizeCoordinates } from "./coordinates";

const publicPrecisionDecimals = 3;
const maxRoundingError = 0.5 * 10 ** -publicPrecisionDecimals + Number.EPSILON * 1000;

function countDecimals(value: number) {
  const [, decimals = ""] = String(value).split(".");

  return decimals.length;
}

function asCoordinates(latitude: unknown, longitude: unknown) {
  return { latitude, longitude } as unknown as Coordinates;
}

const preciseSamples: Coordinates[] = [
  { latitude: 40.851234, longitude: 14.268456 },
  { latitude: 41.902782, longitude: 12.496366 },
  { latitude: 45.070312, longitude: 7.686856 },
  { latitude: -33.868819, longitude: 151.209295 },
  { latitude: 0.123456, longitude: -0.987654 },
  { latitude: 89.99999, longitude: -179.99999 },
];

describe("normalizeCoordinates", () => {
  it("returns numeric coordinates unchanged when they are in range", () => {
    expect(normalizeCoordinates({ latitude: 40.851234, longitude: 14.268456 })).toEqual({
      latitude: 40.851234,
      longitude: 14.268456,
    });
  });

  it("coerces numeric strings to numbers", () => {
    expect(normalizeCoordinates(asCoordinates("40.851234", "14.268456"))).toEqual({
      latitude: 40.851234,
      longitude: 14.268456,
    });
  });

  it("accepts the exact latitude and longitude boundaries", () => {
    expect(normalizeCoordinates({ latitude: 90, longitude: 180 })).toEqual({
      latitude: 90,
      longitude: 180,
    });
    expect(normalizeCoordinates({ latitude: -90, longitude: -180 })).toEqual({
      latitude: -90,
      longitude: -180,
    });
  });

  it.each([
    ["latitude above 90", 90.0001, 0],
    ["latitude below -90", -90.0001, 0],
    ["longitude above 180", 0, 180.0001],
    ["longitude below -180", 0, -180.0001],
  ])("returns null for out-of-range values (%s)", (_label, latitude, longitude) => {
    expect(normalizeCoordinates({ latitude, longitude })).toBeNull();
  });

  it.each([
    ["NaN latitude", Number.NaN, 14.26],
    ["NaN longitude", 40.85, Number.NaN],
    ["infinite latitude", Number.POSITIVE_INFINITY, 14.26],
    ["infinite longitude", 40.85, Number.NEGATIVE_INFINITY],
    ["undefined latitude", undefined, 14.26],
    ["undefined longitude", 40.85, undefined],
    ["non-numeric string", "abc", "14.26"],
  ])("returns null without throwing for invalid input (%s)", (_label, latitude, longitude) => {
    expect(() => normalizeCoordinates(asCoordinates(latitude, longitude))).not.toThrow();
    expect(normalizeCoordinates(asCoordinates(latitude, longitude))).toBeNull();
  });

  it("returns null without throwing when both fields are missing", () => {
    expect(normalizeCoordinates({} as Coordinates)).toBeNull();
  });

  it("returns null for null coordinates instead of coercing them to 0", () => {
    expect(normalizeCoordinates(asCoordinates(null, null))).toBeNull();
  });
});

describe("approximateCoordinates", () => {
  it("rounds latitude and longitude to 3 decimals", () => {
    expect(approximateCoordinates({ latitude: 40.851234, longitude: 14.268456 })).toEqual({
      latitude: 40.851,
      longitude: 14.268,
    });
  });

  it("rounds up when the fourth decimal is above 5", () => {
    expect(approximateCoordinates({ latitude: 40.8519, longitude: 14.2686 })).toEqual({
      latitude: 40.852,
      longitude: 14.269,
    });
  });

  it("rounds negative coordinates correctly", () => {
    expect(approximateCoordinates({ latitude: -33.868819, longitude: -151.209295 })).toEqual({
      latitude: -33.869,
      longitude: -151.209,
    });
  });

  it("keeps values that already have 3 or fewer decimals unchanged", () => {
    expect(approximateCoordinates({ latitude: 40.85, longitude: 14 })).toEqual({
      latitude: 40.85,
      longitude: 14,
    });
  });

  it("is idempotent", () => {
    for (const sample of preciseSamples) {
      const approximated = approximateCoordinates(sample);

      expect(approximated).not.toBeNull();
      expect(approximateCoordinates(approximated as Coordinates)).toEqual(approximated);
    }
  });

  it.each(
    preciseSamples.map((sample) => [sample.latitude, sample.longitude] as const),
  )("produces a public value less precise than the private one (%f, %f)", (latitude, longitude) => {
    const publicCoordinates = approximateCoordinates({ latitude, longitude });

    expect(publicCoordinates).not.toBeNull();

    const { latitude: publicLatitude, longitude: publicLongitude } =
      publicCoordinates as Coordinates;

    expect(countDecimals(publicLatitude)).toBeLessThanOrEqual(publicPrecisionDecimals);
    expect(countDecimals(publicLongitude)).toBeLessThanOrEqual(publicPrecisionDecimals);
    expect(countDecimals(publicLatitude)).toBeLessThan(countDecimals(latitude));
    expect(countDecimals(publicLongitude)).toBeLessThan(countDecimals(longitude));
    expect(publicLatitude).not.toBe(latitude);
    expect(publicLongitude).not.toBe(longitude);
  });

  it("never moves a coordinate by more than half of the public precision step", () => {
    for (const sample of preciseSamples) {
      const publicCoordinates = approximateCoordinates(sample) as Coordinates;

      expect(Math.abs(publicCoordinates.latitude - sample.latitude)).toBeLessThanOrEqual(
        maxRoundingError,
      );
      expect(Math.abs(publicCoordinates.longitude - sample.longitude)).toBeLessThanOrEqual(
        maxRoundingError,
      );
    }
  });

  it("does not mutate the input coordinates", () => {
    const input = { latitude: 40.851234, longitude: 14.268456 };

    approximateCoordinates(input);

    expect(input).toEqual({ latitude: 40.851234, longitude: 14.268456 });
  });

  it.each([
    ["missing fields", {}],
    ["undefined fields", { latitude: undefined, longitude: undefined }],
    ["NaN fields", { latitude: Number.NaN, longitude: Number.NaN }],
    ["out-of-range latitude", { latitude: 120, longitude: 14.26 }],
  ])("returns null without throwing for unusable input (%s)", (_label, input) => {
    expect(() => approximateCoordinates(input as Coordinates)).not.toThrow();
    expect(approximateCoordinates(input as Coordinates)).toBeNull();
  });

  it("returns null for null coordinates instead of publishing (0, 0)", () => {
    expect(approximateCoordinates(asCoordinates(null, null))).toBeNull();
  });
});
