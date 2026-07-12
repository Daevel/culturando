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
              <StatRow
                label={t("admin.publication.publicBooksLabel")}
                value={stats.publicBooksCount}
              />
              <StatRow
                label={t("admin.publication.privateBooksLabel")}
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
              <StatRow
                label={t("admin.requests.pendingLabel")}
                value={stats.pendingRequestsCount}
              />
              <StatRow
                label={t("admin.requests.acceptedLabel")}
                value={stats.acceptedRequestsCount}
              />
              <StatRow
                label={t("admin.requests.rejectedLabel")}
                value={stats.rejectedRequestsCount}
              />
              <StatRow
                label={t("admin.requests.cancelledLabel")}
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

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
