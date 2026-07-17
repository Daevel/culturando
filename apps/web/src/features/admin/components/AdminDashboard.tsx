"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useTranslation } from "@/hooks/useTranslation";
import type { AdminStats } from "../actions/admin-stats.repository";

type AdminDashboardProps = {
  stats: AdminStats;
};

export function AdminDashboard({ stats }: AdminDashboardProps) {
  const t = useTranslation();

  return (
    <PageShell>
      <PageContainer size="xl">
        <PageHeader>
          <PageHeaderContent>
            <PageEyebrow>{t("admin.eyebrow")}</PageEyebrow>
            <PageTitle className="lg:text-4xl">{t("admin.title")}</PageTitle>
            <PageDescription className="max-w-3xl">{t("admin.description")}</PageDescription>
          </PageHeaderContent>

          <Button asChild className="w-full sm:w-auto" variant="outline">
            <Link href={routes.dashboard}>{t("admin.backToDashboardLabel")}</Link>
          </Button>
        </PageHeader>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label={t("admin.stats.usersLabel")} value={stats.usersCount} />
          <StatTile label={t("admin.stats.booksLabel")} value={stats.booksCount} />
          <StatTile label={t("admin.stats.requestsLabel")} value={stats.requestsCount} />
          <StatTile label={t("admin.stats.viewsLabel")} value={stats.totalViewsCount} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.publication.title")}</CardTitle>
              <CardDescription>{t("admin.publication.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <StatBar
                label={t("admin.publication.publicBooksLabel")}
                maxValue={stats.booksCount}
                value={stats.publicBooksCount}
              />
              <StatBar
                label={t("admin.publication.privateBooksLabel")}
                maxValue={stats.booksCount}
                value={stats.privateBooksCount}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("admin.requests.title")}</CardTitle>
              <CardDescription>{t("admin.requests.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <StatBar
                label={t("admin.requests.pendingLabel")}
                maxValue={stats.requestsCount}
                value={stats.pendingRequestsCount}
              />
              <StatBar
                label={t("admin.requests.acceptedLabel")}
                maxValue={stats.requestsCount}
                value={stats.acceptedRequestsCount}
              />
              <StatBar
                label={t("admin.requests.rejectedLabel")}
                maxValue={stats.requestsCount}
                value={stats.rejectedRequestsCount}
              />
              <StatBar
                label={t("admin.requests.cancelledLabel")}
                maxValue={stats.requestsCount}
                value={stats.cancelledRequestsCount}
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.latestUsers.title")}</CardTitle>
              <CardDescription>{t("admin.latestUsers.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.latestUsers.map((user) => (
                <div className="rounded-lg border bg-muted/30 p-3" key={user.id}>
                  <p className="font-medium">{user.name ?? t("admin.emptyName")}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("admin.latestBooks.title")}</CardTitle>
              <CardDescription>{t("admin.latestBooks.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.latestBooks.map((book) => (
                <div className="rounded-lg border bg-muted/30 p-3" key={book.id}>
                  <Link className="font-medium hover:underline" href={routes.bookDetail(book.id)}>
                    {book.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("admin.latestBooks.ownerLabel")} {book.ownerName ?? book.ownerEmail}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </PageShell>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

function StatBar({ label, maxValue, value }: { label: string; maxValue: number; value: number }) {
  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${getChartPercentage(value, maxValue)}%` }}
        />
      </div>
    </div>
  );
}

// CSS-only bars keep the administrative metrics readable without adding chart libraries.
function getChartPercentage(value: number, maxValue: number) {
  if (maxValue <= 0) {
    return 0;
  }

  return Math.max(4, Math.min(100, Math.round((value / maxValue) * 100)));
}
