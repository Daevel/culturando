import type { UserRole } from "./auth.types";

export type SalutationPreference = "masculine" | "feminine" | "neutral";

export type UserProfile = {
  id: string;
  email: string;
  name?: string;
  nickname?: string;
  nicknameUpdatedAt?: string;
  salutationPreference: SalutationPreference;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  addressLabel?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  region?: string;
  isProfilePublic: boolean;
  createdAt: string;
  updatedAt: string;
};
