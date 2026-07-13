"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/config/auth";
import { routes } from "@/config/routes";
import { updateUserProfileVisibility } from "@/features/profile/actions/profile.repository";

export async function updateProfileVisibilityAction(isProfilePublic: boolean) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false };
  }

  await updateUserProfileVisibility(session.user.id, isProfilePublic);

  revalidatePath(routes.dashboard);
  revalidatePath(routes.dashboardProfile);
  revalidatePath(routes.dashboardSettings);

  return { success: true };
}
