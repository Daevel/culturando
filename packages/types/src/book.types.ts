export type BookVisibility = "public" | "private";

export type BookAvailability = "available" | "consultation_only" | "loanable" | "unavailable";

export type BookPhysicalCondition = "new" | "good" | "worn" | "damaged";

export type BookApproximateLocation = {
  latitude: number;
  longitude: number;
  radiusMeters: number;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  category?: string;
  ownerId: string;
  availability: BookAvailability;
  visibility: BookVisibility;
  physicalCondition: BookPhysicalCondition;
  approximateLocation?: BookApproximateLocation;
  createdAt: string;
  updatedAt: string;
};
