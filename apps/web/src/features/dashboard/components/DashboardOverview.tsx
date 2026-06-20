import Link from "next/link";
import type { Session } from "next-auth";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { routes } from "@/config/routes";
import type { ReceivedLoanRequest } from "@/features/requests/actions/loan-requests.repository";
import { ReceivedLoanRequests } from "@/features/requests/components/ReceivedLoanRequests";
import { useTranslation } from "@/hooks/useTranslation";

type DashboardOverviewProps = {
  logoutAction: () => Promise<void>;
  receivedLoanRequests: ReceivedLoanRequest[];
  user: NonNullable<Session["user"]>;
};

export function DashboardOverview({
  logoutAction,
  receivedLoanRequests,
  user,
}: DashboardOverviewProps) {
  const t = useTranslation();
  const displayName = user.name ?? user.email ?? t("dashboard.userFallback");

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <section className="mx-auto flex max-w-5xl flex-col gap-y-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{t("dashboard.eyebrow")}</p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {t("dashboard.title")}
            </h1>
            <p className="max-w-2xl text-muted-foreground">{t("dashboard.description")}</p>
          </div>

          <form action={logoutAction}>
            <Button type="submit" variant="outline">
              {t("dashboard.logoutLabel")}
            </Button>
          </form>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{t("dashboard.sessionCard.title")}</CardTitle>
              <CardDescription>{t("dashboard.sessionCard.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("dashboard.sessionCard.nameLabel")}
                </p>
                <p className="text-lg font-semibold">{displayName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("dashboard.sessionCard.emailLabel")}
                </p>
                <p>{user.email ?? t("dashboard.sessionCard.emptyValue")}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.quickActions.title")}</CardTitle>
              <CardDescription>{t("dashboard.quickActions.description")}</CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col items-stretch gap-y-3">
              <Button asChild>
                <Link href={routes.newBook}>{t("dashboard.quickActions.newBookLabel")}</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href={routes.books}>{t("dashboard.quickActions.booksLabel")}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={routes.dashboardRequests}>
                  {t("dashboard.quickActions.requestsLabel")}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <ReceivedLoanRequests requests={receivedLoanRequests} />
      </section>
    </main>
  );
}
