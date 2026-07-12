"use server";

import { auth } from "@/config/auth";
import { getUserIdByNickname } from "./profile.repository";

export async function checkProfileNicknameAvailabilityAction(nicknameValue: string) {
  const session = await auth();
  const nickname = normalizeNickname(nicknameValue);

  if (!session?.user?.id || !nickname) {
    return { isAvailable: false };
  }

  const existingUserId = await getUserIdByNickname(nickname);

  return {
    isAvailable: !existingUserId || existingUserId === session.user.id,
  };
}

function normalizeNickname(value: string) {
  return value.trim().toLowerCase();
}
