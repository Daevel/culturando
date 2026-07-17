export type BookVisibility = "public" | "private";

export type BookAvailability = "available" | "consultation_only" | "loanable" | "unavailable";

export type BookPhysicalCondition = "new" | "good" | "worn" | "damaged";

export type BookImageSource = "user_upload" | "external_api";

export type BookLocation = {
  id: string;
  addressLabel: string;
  city?: string;
  province?: string;
  region?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  publicLatitude?: number;
  publicLongitude?: number;
  accuracyRadiusMeters: number;
};

export type BookImage = {
  id: string;
  bookId: string;
  url: string;
  thumbnailUrl?: string;
  source: BookImageSource;
  alt?: string;
  isPrimary: boolean;
  createdAt: string;
};

export type BookStats = {
  viewCount: number;
};

export type BookOwner = {
  email?: string;
  name?: string;
  nickname?: string;
};

export type Book = {
  id: string;
  ownerId: string;
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  publisher?: string;
  publishedYear?: number;
  language?: string;
  category?: string;
  availability: BookAvailability;
  visibility: BookVisibility;
  physicalCondition: BookPhysicalCondition;
  owner?: BookOwner;
  location?: BookLocation;
  images: BookImage[];
  stats?: BookStats;
  createdAt: string;
  updatedAt: string;
};
