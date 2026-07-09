import { BookOpen, BookPlus, Inbox, ShieldCheck, UserRound } from "lucide-react";
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
  receivedLoanRequests: ReceivedLoanRequest[];
  stats: DashboardStats | null;
  user: NonNullable<Session["user"]>;
};

export function DashboardOverview({ receivedLoanRequests, stats, user }: DashboardOverviewProps) {
  const t = useTranslation();
  const displayName = user.name ?? user.email ?? t("dashboard.userFallback");
  const welcomeTitleKey = getWelcomeTitleKey(user.salutationPreference);

  return (
    <PageShell>
      <PageContainer size="xl">
        <PageHeader>
          <PageHeaderContent>
            <PageTitle className="lg:text-4xl">
              {t(welcomeTitleKey)} {displayName}
            </PageTitle>
            <PageDescription>{t("dashboard.description")}</PageDescription>
          </PageHeaderContent>
        </PageHeader>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
          {stats ? (
            <Card className="xl:flex-[1.65]">
              <CardHeader>
                <CardTitle>{t("dashboard.stats.title")}</CardTitle>
                <CardDescription>{t("dashboard.stats.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
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

                <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr] xl:grid-cols-1 2xl:grid-cols-[1fr_1.4fr]">
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

          <div className="flex flex-col gap-4 xl:flex-[1] xl:self-stretch">
            <Card className="shrink-0">
              <CardHeader>
                <CardTitle>{t("dashboard.quickActions.title")}</CardTitle>
                <CardDescription>{t("dashboard.quickActions.description")}</CardDescription>
              </CardHeader>
              <CardFooter className="flex flex-col items-stretch gap-5">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    {t("dashboard.quickActions.primaryGroupLabel")}
                  </p>
                  <Button asChild className="w-full">
                    <Link className="grid grid-cols-[1rem_1fr] justify-start" href={routes.newBook}>
                      <BookPlus aria-hidden="true" className="size-4 justify-self-center" />
                      <span className="text-left">{t("dashboard.quickActions.newBookLabel")}</span>
                    </Link>
                  </Button>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    {t("dashboard.quickActions.secondaryGroupLabel")}
                  </p>
                  <div className="flex flex-col gap-3">
                    <Button asChild className="w-full" variant="secondary">
                      <Link className="grid grid-cols-[1rem_1fr] justify-start" href={routes.books}>
                        <BookOpen aria-hidden="true" className="size-4 justify-self-center" />
                        <span className="text-left">{t("dashboard.quickActions.booksLabel")}</span>
                      </Link>
                    </Button>
                    <Button asChild className="w-full" variant="secondary">
                      <Link
                        className="grid grid-cols-[1rem_1fr] justify-start"
                        href={routes.dashboardProfile}
                      >
                        <UserRound aria-hidden="true" className="size-4 justify-self-center" />
                        <span className="text-left">
                          {t("dashboard.quickActions.profileLabel")}
                        </span>
                      </Link>
                    </Button>
                    <Button asChild className="w-full" variant="outline">
                      <Link
                        className="grid grid-cols-[1rem_1fr] justify-start"
                        href={routes.dashboardRequests}
                      >
                        <Inbox aria-hidden="true" className="size-4 justify-self-center" />
                        <span className="text-left">
                          {t("dashboard.quickActions.requestsLabel")}
                        </span>
                      </Link>
                    </Button>
                  </div>
                </div>

                {user.role === "admin" ? (
                  <div className="space-y-2 border-t pt-4">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      {t("dashboard.quickActions.adminGroupLabel")}
                    </p>
                    <Button asChild className="w-full" variant="outline">
                      <Link
                        className="grid grid-cols-[1rem_1fr] justify-start"
                        href={routes.dashboardAdmin}
                      >
                        <ShieldCheck aria-hidden="true" className="size-4 justify-self-center" />
                        <span className="text-left">{t("dashboard.quickActions.adminLabel")}</span>
                      </Link>
                    </Button>
                  </div>
                ) : null}
              </CardFooter>
            </Card>

            <ReceivedLoanRequests requests={receivedLoanRequests} />
          </div>
        </div>
      </PageContainer>
    </PageShell>
  );
}

function getWelcomeTitleKey(salutationPreference: Session["user"]["salutationPreference"]) {
  if (salutationPreference === "masculine") {
    return "dashboard.welcomeTitle.masculine";
  }

  if (salutationPreference === "feminine") {
    return "dashboard.welcomeTitle.feminine";
  }

  return "dashboard.welcomeTitle.neutral";
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex min-h-28 flex-col justify-between rounded-lg border bg-muted/30 p-4">
      <p className="min-h-10 text-balance text-sm leading-5 text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
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
