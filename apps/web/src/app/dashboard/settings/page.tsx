import { redirect } from "next/navigation";

import { auth } from "@/config/auth";
import { routes } from "@/config/routes";
import { SettingsPageContent } from "@/features/settings/components/SettingsPageContent";

export default async function DashboardSettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(routes.login);
  }

  return <SettingsPageContent />;
}
