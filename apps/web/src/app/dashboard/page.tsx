import { redirect } from "next/navigation";

import { auth } from "@/config/auth";
import { routes } from "@/config/routes";
import { logoutAction } from "@/features/auth/actions/logout.action";
import { DashboardOverview } from "@/features/dashboard/components/DashboardOverview";
import { getReceivedLoanRequests } from "@/features/requests/actions/loan-requests.repository";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect(routes.login);
  }

  const receivedLoanRequests = session.user.id ? await getReceivedLoanRequests(session.user.id) : [];

  return (
    <DashboardOverview
      logoutAction={logoutAction}
      receivedLoanRequests={receivedLoanRequests}
      user={session.user}
    />
  );
}
