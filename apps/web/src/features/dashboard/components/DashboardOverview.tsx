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
import {
  PageContainer,
  PageDescription,
  PageEyebrow,
  PageHeader,
  PageHeaderContent,
  PageShell,
  PageTitle,
} from "@/components/ui/page";
import { routes } from "@/config/routes";
import type { DashboardStats } from "@/features/dashboard/actions/dashboard-stats.repository";
import type { ReceivedLoanRequest } from "@/features/requests/actions/loan-requests.repository";
import { ReceivedLoanRequests } from "@/features/requests/components/ReceivedLoanRequests";
import { useTranslation } from "@/hooks/useTranslation";

type DashboardOverviewProps = {
  logoutAction: () => Promise<void>;
  receivedLoanRequests: ReceivedLoanRequest[];
  stats: DashboardStats | null;
  user: NonNullable<Session["user"]>;
};

export function DashboardOverview({
  logoutAction,
  receivedLoanRequests,
  stats,
  user,
}: DashboardOverviewProps) {
  const t = useTranslation();
  const displayName = user.name ?? user.email ?? t("dashboard.userFallback");

  return (
    <PageShell>
      <PageContainer size="lg">
        <PageHeader className="sm:flex-row sm:items-center">
          <PageHeaderContent>
            <PageEyebrow>{t("dashboard.eyebrow")}</PageEyebrow>
            <PageTitle className="lg:text-4xl">{t("dashboard.title")}</PageTitle>
            <PageDescription>{t("dashboard.description")}</PageDescription>
          </PageHeaderContent>

          <form action={logoutAction} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto" type="submit" variant="outline">
              {t("dashboard.logoutLabel")}
            </Button>
          </form>
        </PageHeader>

        {stats ? (
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.stats.title")}</CardTitle>
              <CardDescription>{t("dashboard.stats.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatTile label={t("dashboard.stats.booksLabel")} value={stats.booksCount} />
                <StatTile label={t("dashboard.stats.viewsLabel")} value={stats.totalViewsCount} />
                <StatTile
                  label={t("dashboard.stats.requestsLabel")}
                  value={stats.receivedRequestsCount}
                />
                <StatTile
                  label={t("dashboard.stats.pendingRequestsLabel")}
                  value={stats.pendingRequestsCount}
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
                <div className="rounded-lg border bg-card p-4">
                  <h2 className="font-semibold">{t("dashboard.stats.visibilityTitle")}</h2>
                  <div className="mt-4 space-y-3">
                    <StatRow
                      label={t("dashboard.stats.publicBooksLabel")}
                      value={stats.publicBooksCount}
                    />
                    <StatRow
                      label={t("dashboard.stats.privateBooksLabel")}
                      value={stats.privateBooksCount}
                    />
                    <StatRow
                      label={t("dashboard.stats.acceptedRequestsLabel")}
                      value={stats.acceptedRequestsCount}
                    />
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-4">
                  <h2 className="font-semibold">{t("dashboard.stats.topBooksTitle")}</h2>
                  {stats.topViewedBooks.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {stats.topViewedBooks.map((book) => (
                        <div
                          className="flex items-center justify-between gap-4 rounded-md bg-muted/40 px-3 py-2"
                          key={book.id}
                        >
                          <div>
                            <Link
                              className="font-medium hover:underline"
                              href={routes.bookDetail(book.id)}
                            >
                              {book.title}
                            </Link>
                            <p className="text-sm text-muted-foreground">{book.author}</p>
                          </div>
                          <span className="shrink-0 font-semibold">{book.viewCount}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-muted-foreground">
                      {t("dashboard.stats.emptyTopBooks")}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

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
                <Link href={routes.dashboardProfile}>
                  {t("dashboard.quickActions.profileLabel")}
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href={routes.books}>{t("dashboard.quickActions.booksLabel")}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={routes.dashboardRequests}>
                  {t("dashboard.quickActions.requestsLabel")}
                </Link>
              </Button>
              {user.role === "admin" ? (
                <Button asChild variant="outline">
                  <Link href={routes.dashboardAdmin}>{t("dashboard.quickActions.adminLabel")}</Link>
                </Button>
              ) : null}
            </CardFooter>
          </Card>
        </div>

        <ReceivedLoanRequests requests={receivedLoanRequests} />
      </PageContainer>
    </PageShell>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
