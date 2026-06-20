import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/config/routes";
import { useTranslation } from "@/hooks/useTranslation";
import { cancelLoanRequestAction } from "../actions/cancel-loan-request.action";
import type { SentLoanRequest } from "../actions/loan-requests.repository";

type SentLoanRequestsProps = {
  requests: SentLoanRequest[];
};

export function SentLoanRequests({ requests }: SentLoanRequestsProps) {
  const t = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("requests.sent.title")}</CardTitle>
        <CardDescription>{t("requests.sent.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("requests.sent.emptyState")}</p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <article key={request.id} className="rounded-lg border p-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="space-y-1">
                    <Link
                      className="font-semibold hover:underline"
                      href={routes.bookDetail(request.book.id)}
                    >
                      {request.book.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">{request.book.author}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{t(`requests.type.${request.type}`)}</Badge>
                    <Badge variant="outline">{t(`requests.status.${request.status}`)}</Badge>
                  </div>
                </div>
                <dl className="mt-4 space-y-2 text-sm">
                  <div>
                    <dt className="font-medium text-muted-foreground">
                      {t("requests.sent.ownerLabel")}
                    </dt>
                    <dd>
                      {request.owner.name ?? request.owner.email ?? t("dashboard.userFallback")}
                    </dd>
                  </div>
                  {request.message ? (
                    <div>
                      <dt className="font-medium text-muted-foreground">
                        {t("requests.sent.messageLabel")}
                      </dt>
                      <dd className="leading-6">{request.message}</dd>
                    </div>
                  ) : null}
                </dl>
                {request.status === "pending" ? (
                  <form className="mt-4" action={cancelLoanRequestAction.bind(null, request.id)}>
                    <Button size="sm" type="submit" variant="outline">
                      {t("requests.sent.cancelLabel")}
                    </Button>
                  </form>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
