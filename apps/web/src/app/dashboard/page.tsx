import { redirect } from "next/navigation";

import { auth } from "@/config/auth";
import { routes } from "@/config/routes";
import { logoutAction } from "@/features/auth/actions/logout.action";
import { DashboardOverview } from "@/features/dashboard/components/DashboardOverview";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect(routes.login);
  }

  return <DashboardOverview logoutAction={logoutAction} user={session.user} />;
}
