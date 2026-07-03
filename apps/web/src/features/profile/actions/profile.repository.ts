import { prisma } from "@culturando/db";
import type { UserProfile } from "@culturando/types";

import type { ProfileFormValues } from "../schemas/profile.schema";

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
      bio: true,
      city: true,
      province: true,
      region: true,
      isProfilePublic: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user ? toUserProfile(user) : null;
}

export async function updateUserProfile(userId: string, values: ProfileFormValues) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      name: values.name,
      avatarUrl: emptyToNull(values.avatarUrl),
      bio: emptyToNull(values.bio),
      city: emptyToNull(values.city),
      province: emptyToNull(values.province),
      region: emptyToNull(values.region),
      isProfilePublic: values.isProfilePublic,
    },
  });
}

type StoredUserProfile = {
  id: string;
  email: string;
  name: string | null;
  role: UserProfile["role"];
  avatarUrl: string | null;
  bio: string | null;
  city: string | null;
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
    role: user.role,
    avatarUrl: user.avatarUrl ?? undefined,
    bio: user.bio ?? undefined,
    city: user.city ?? undefined,
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
