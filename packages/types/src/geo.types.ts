export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type PublicLocation = {
  city?: string;
  district?: string;
  coordinates?: Coordinates;
  approximateRadiusMeters?: number;
};