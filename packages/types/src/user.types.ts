import type { UserRole } from "./auth.types";

export type SalutationPreference = "masculine" | "feminine" | "neutral";

export type UserProfile = {
  id: string;
  email: string;
  name?: string;
  salutationPreference: SalutationPreference;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  city?: string;
  province?: string;
  region?: string;
  isProfilePublic: boolean;
  createdAt: string;
  updatedAt: string;
};
