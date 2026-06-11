"use server";

import { signOut } from "@/auth";
import { routes } from "@/config/routes";

export async function logoutAction() {
  await signOut({ redirectTo: routes.login });
}
