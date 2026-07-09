import { auth } from "@/config/auth";
import { logoutAction } from "@/features/auth/actions/logout.action";
import { DashboardFloatingBar } from "@/features/dashboard/components/DashboardFloatingBar";

export async function AppFloatingBar() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return <DashboardFloatingBar logoutAction={logoutAction} user={session.user} />;
}
