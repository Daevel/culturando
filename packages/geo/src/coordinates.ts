import type { Coordinates } from "@culturando/types";

const publicPrecisionDecimals = 3;

export function normalizeCoordinates(coordinates: Coordinates): Coordinates | null {
  const latitude = Number(coordinates.latitude);
  const longitude = Number(coordinates.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return null;
  }

  return {
    latitude,
    longitude,
  };
}

export function approximateCoordinates(coordinates: Coordinates): Coordinates | null {
  const normalizedCoordinates = normalizeCoordinates(coordinates);

  if (!normalizedCoordinates) {
    return null;
  }

  return {
    latitude: roundCoordinate(normalizedCoordinates.latitude),
    longitude: roundCoordinate(normalizedCoordinates.longitude),
  };
}

function roundCoordinate(value: number) {
  return Number(value.toFixed(publicPrecisionDecimals));
}
