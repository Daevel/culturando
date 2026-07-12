import { prisma } from "@culturando/db";
import type { UserProfile } from "@culturando/types";

import type { ProfileFormValues } from "../schemas/profile.schema";

export const NICKNAME_CHANGE_INTERVAL_DAYS = 90;

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      nickname: true,
      nicknameUpdatedAt: true,
      salutationPreference: true,
      role: true,
      addressLabel: true,
      avatarUrl: true,
      bio: true,
      city: true,
      postalCode: true,
      province: true,
      region: true,
      isProfilePublic: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user ? toUserProfile(user) : null;
}

export async function updateUserProfile(
  userId: string,
  values: ProfileFormValues,
  options: { nicknameChanged?: boolean } = {},
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      name: values.name,
      nickname: values.nickname,
      ...(options.nicknameChanged ? { nicknameUpdatedAt: new Date() } : {}),
      addressLabel: emptyToNull(values.addressLabel),
      avatarUrl: emptyToNull(values.avatarUrl),
      bio: emptyToNull(values.bio),
      city: emptyToNull(values.city),
      postalCode: emptyToNull(values.postalCode),
      province: emptyToNull(values.province),
      region: emptyToNull(values.region),
      isProfilePublic: values.isProfilePublic,
    },
  });
}

export async function getUserNicknameState(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      nickname: true,
      nicknameUpdatedAt: true,
    },
  });
}

export async function getUserIdByNickname(nickname: string) {
  const user = await prisma.user.findUnique({
    where: { nickname },
    select: { id: true },
  });

  return user?.id;
}

export function canChangeNickname(lastChangedAt: Date | null | undefined) {
  if (!lastChangedAt) {
    return true;
  }

  return Date.now() >= getNextNicknameChangeDate(lastChangedAt).getTime();
}

export function getNextNicknameChangeDate(lastChangedAt: Date) {
  return new Date(lastChangedAt.getTime() + NICKNAME_CHANGE_INTERVAL_DAYS * 24 * 60 * 60 * 1000);
}

type StoredUserProfile = {
  id: string;
  email: string;
  name: string | null;
  nickname: string | null;
  nicknameUpdatedAt: Date | null;
  salutationPreference: UserProfile["salutationPreference"];
  role: UserProfile["role"];
  addressLabel: string | null;
  avatarUrl: string | null;
  bio: string | null;
  city: string | null;
  postalCode: string | null;
  province: string | null;
  region: string | null;
  isProfilePublic: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function toUserProfile(user: StoredUserProfile): UserProfile {
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? undefined,
    nickname: user.nickname ?? undefined,
    nicknameUpdatedAt: user.nicknameUpdatedAt?.toISOString(),
    salutationPreference: user.salutationPreference,
    role: user.role,
    addressLabel: user.addressLabel ?? undefined,
    avatarUrl: user.avatarUrl ?? undefined,
    bio: user.bio ?? undefined,
    city: user.city ?? undefined,
    postalCode: user.postalCode ?? undefined,
    province: user.province ?? undefined,
    region: user.region ?? undefined,
    isProfilePublic: user.isProfilePublic,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

function emptyToNull(value: string | undefined) {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : null;
}
