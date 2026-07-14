import { redirect } from "next/navigation";

import { auth } from "@/config/auth";
import { routes } from "@/config/routes";
import { getBooksByOwnerId } from "@/features/books/actions/books.repository";
import { getDashboardStats } from "@/features/dashboard/actions/dashboard-stats.repository";
import { DashboardOverview } from "@/features/dashboard/components/DashboardOverview";
import { getReceivedLoanRequests } from "@/features/requests/actions/loan-requests.repository";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect(routes.login);
  }

  const [receivedLoanRequests, stats, userBooks] = session.user.id
    ? await Promise.all([
        getReceivedLoanRequests(session.user.id),
        getDashboardStats(session.user.id),
        getBooksByOwnerId(session.user.id),
      ])
    : [[], null, []];

  return (
    <DashboardOverview
      receivedLoanRequests={receivedLoanRequests}
      stats={stats}
      userBooks={userBooks}
      user={session.user}
    />
  );
}
