"use server";

import { signOut } from "@/config/auth";
import { routes } from "@/config/routes";

export async function logoutAction() {
  await signOut({ redirectTo: routes.login });
}
