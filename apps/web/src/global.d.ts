import type { SalutationPreference, UserRole } from "@culturando/types";
import type { DefaultSession } from "next-auth";

declare module "*.css";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: UserRole;
      salutationPreference?: SalutationPreference;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: UserRole;
    salutationPreference?: SalutationPreference;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    salutationPreference?: SalutationPreference;
  }
}
