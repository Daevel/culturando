export type AuthProvider = "credentials" | "google";

export type AuthStatus = "authenticated" | "unauthenticated" | "loading";

export type UserRole = "user" | "admin";

export type SessionUser = {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
};