import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { routes } from "@/config/routes";
import { DashboardOverview } from "@/features/dashboard/components/DashboardOverview";

export default async function DashboardPage() {
  const session = await auth();

  console.log("session", session);

  if (!session?.user) {
    redirect(routes.login);
  }

  return <DashboardOverview user={session.user} />;
}
