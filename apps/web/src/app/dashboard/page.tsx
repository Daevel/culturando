import { redirect } from "next/navigation";

import { auth } from "@/config/auth";
import { routes } from "@/config/routes";
import { getDashboardStats } from "@/features/dashboard/actions/dashboard-stats.repository";
import { DashboardOverview } from "@/features/dashboard/components/DashboardOverview";
import { getReceivedLoanRequests } from "@/features/requests/actions/loan-requests.repository";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect(routes.login);
  }

  const [receivedLoanRequests, stats] = session.user.id
    ? await Promise.all([
        getReceivedLoanRequests(session.user.id),
        getDashboardStats(session.user.id),
      ])
    : [[], null];

  return (
    <DashboardOverview
      receivedLoanRequests={receivedLoanRequests}
      stats={stats}
      user={session.user}
    />
  );
}
