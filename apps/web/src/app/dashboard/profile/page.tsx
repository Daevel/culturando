import { notFound, redirect } from "next/navigation";

import { auth } from "@/config/auth";
import { routes } from "@/config/routes";
import { getUserProfile } from "@/features/profile/actions/profile.repository";
import { ProfileForm } from "@/features/profile/components/ProfileForm";

export default async function DashboardProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(routes.login);
  }

  const profile = await getUserProfile(session.user.id);

  if (!profile) {
    notFound();
  }

  return <ProfileForm profile={profile} />;
}
