import { notFound, redirect } from "next/navigation";

import { auth } from "@/config/auth";
import { routes } from "@/config/routes";
import { getAdminStats } from "@/features/admin/actions/admin-stats.repository";
import { AdminDashboard } from "@/features/admin/components/AdminDashboard";
import { isAdminSession } from "@/lib/authorization";

export default async function DashboardAdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect(routes.login);
  }

  if (!isAdminSession(session)) {
    notFound();
  }

  const stats = await getAdminStats();

  return <AdminDashboard stats={stats} />;
}
