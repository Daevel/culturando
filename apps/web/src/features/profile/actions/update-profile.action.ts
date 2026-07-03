"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/config/auth";
import { routes } from "@/config/routes";
import { validateProfileForm } from "../schemas/profile.schema";
import type { ProfileFormField, ProfileFormState } from "../types/profile-form.types";
import { updateUserProfile } from "./profile.repository";

export async function updateProfileAction(
  _state: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      errors: {},
      messageKey: "profile.form.unauthorizedMessage",
    };
  }

  const validation = validateProfileForm({
    name: formData.get("name"),
    avatarUrl: formData.get("avatarUrl"),
    bio: formData.get("bio"),
    city: formData.get("city"),
    province: formData.get("province"),
    region: formData.get("region"),
    isProfilePublic: formData.get("isProfilePublic") === "on",
  });

  if (!validation.isValid) {
    const errors = validation.errors as Partial<Record<ProfileFormField, string[]>>;

    return {
      success: false,
      errors: {
        name: errors.name?.[0],
        avatarUrl: errors.avatarUrl?.[0],
        bio: errors.bio?.[0],
        city: errors.city?.[0],
        province: errors.province?.[0],
        region: errors.region?.[0],
      },
    };
  }

  if (!validation.data) {
    return {
      success: false,
      errors: {},
      messageKey: "profile.form.genericErrorMessage",
    };
  }

  await updateUserProfile(session.user.id, validation.data);
  revalidatePath(routes.dashboard);
  revalidatePath(routes.dashboardProfile);

  return {
    success: true,
    errors: {},
    messageKey: "profile.form.successMessage",
  };
}
