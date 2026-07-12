"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/config/auth";
import { routes } from "@/config/routes";
import { validateProfileForm } from "../schemas/profile.schema";
import type { ProfileFormField, ProfileFormState } from "../types/profile-form.types";
import {
  canChangeNickname,
  getNextNicknameChangeDate,
  getUserIdByNickname,
  getUserNicknameState,
  updateUserProfile,
} from "./profile.repository";
import { saveProfileAvatar } from "./profile-avatar-storage";

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
    addressLabel: formData.get("addressLabel"),
    avatarUrl: formData.get("avatarUrl"),
    bio: formData.get("bio"),
    city: formData.get("city"),
    postalCode: formData.get("postalCode"),
    province: formData.get("province"),
    region: formData.get("region"),
    isProfilePublic: formData.get("isProfilePublic") === "on",
    nickname: formData.get("nickname"),
  });

  if (!validation.isValid) {
    const errors = validation.errors as Partial<Record<ProfileFormField, string[]>>;

    return {
      success: false,
      errors: {
        name: errors.name?.[0],
        addressLabel: errors.addressLabel?.[0],
        avatarUrl: errors.avatarUrl?.[0],
        bio: errors.bio?.[0],
        city: errors.city?.[0],
        nickname: errors.nickname?.[0],
        postalCode: errors.postalCode?.[0],
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

  const nicknameState = await getUserNicknameState(session.user.id);
  const nicknameChanged = nicknameState?.nickname !== validation.data.nickname;

  if (nicknameChanged) {
    if (!canChangeNickname(nicknameState?.nicknameUpdatedAt)) {
      const nextChangeDate = getNextNicknameChangeDate(nicknameState?.nicknameUpdatedAt as Date);

      return {
        success: false,
        errors: {
          nickname: `Potrai cambiare nickname dal ${nextChangeDate.toLocaleDateString("it-IT")}.`,
        },
      };
    }

    const existingUserId = await getUserIdByNickname(validation.data.nickname);

    if (existingUserId && existingUserId !== session.user.id) {
      return {
        success: false,
        errors: {
          nickname: "Questo nickname è già in uso.",
        },
      };
    }
  }

  const uploadedAvatar = await saveProfileAvatar(formData.get("avatarImage"));

  if (uploadedAvatar.error) {
    return {
      success: false,
      errors: {
        avatarUrl: uploadedAvatar.error,
      },
    };
  }

  await updateUserProfile(
    session.user.id,
    {
      ...validation.data,
      avatarUrl: uploadedAvatar.url ?? validation.data.avatarUrl,
    },
    { nicknameChanged },
  );
  revalidatePath(routes.dashboard);
  revalidatePath(routes.dashboardProfile);

  return {
    success: true,
    errors: {},
    messageKey: "profile.form.successMessage",
  };
}
