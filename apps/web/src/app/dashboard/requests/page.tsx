import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
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
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <section className="mx-auto flex max-w-5xl flex-col gap-y-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {t("requests.page.eyebrow")}
            </p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {t("requests.page.title")}
            </h1>
            <p className="max-w-2xl text-muted-foreground">{t("requests.page.description")}</p>
          </div>
          <Button asChild variant="outline">
            <Link href={routes.dashboard}>{t("requests.page.backToDashboardLabel")}</Link>
          </Button>
        </div>

        <SentLoanRequests requests={sentLoanRequests} />
      </section>
    </main>
  );
}
