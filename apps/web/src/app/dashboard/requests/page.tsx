import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  PageContainer,
  PageDescription,
  PageEyebrow,
  PageHeader,
  PageHeaderContent,
  PageShell,
  PageTitle,
} from "@/components/ui/page";
import { auth } from "@/config/auth";
import { routes } from "@/config/routes";
import { getSentLoanRequests } from "@/features/requests/actions/loan-requests.repository";
import { SentLoanRequests } from "@/features/requests/components/SentLoanRequests";
import { useTranslation } from "@/hooks/useTranslation";

export default async function DashboardRequestsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect(routes.login);
  }

  const t = useTranslation();
  const sentLoanRequests = session.user.id ? await getSentLoanRequests(session.user.id) : [];

  return (
    <PageShell>
      <PageContainer size="lg">
        <PageHeader className="sm:flex-row sm:items-center">
          <PageHeaderContent>
            <PageEyebrow>{t("requests.page.eyebrow")}</PageEyebrow>
            <PageTitle className="lg:text-4xl">{t("requests.page.title")}</PageTitle>
            <PageDescription>{t("requests.page.description")}</PageDescription>
          </PageHeaderContent>
          <Button asChild className="w-full sm:w-auto" variant="outline">
            <Link href={routes.dashboard}>{t("requests.page.backToDashboardLabel")}</Link>
          </Button>
        </PageHeader>

        <SentLoanRequests requests={sentLoanRequests} />
      </PageContainer>
    </PageShell>
  );
}
