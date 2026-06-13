import type { UserRole } from "./auth.types";

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
};
