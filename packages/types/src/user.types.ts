import type { UserRole } from "./auth.types";

export type UserProfile = {
  id: string;
  email: string;
  name?: string;
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
