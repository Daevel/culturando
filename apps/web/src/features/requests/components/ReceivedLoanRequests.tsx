import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/config/routes";
import { useTranslation } from "@/hooks/useTranslation";
import type { ReceivedLoanRequest } from "../actions/loan-requests.repository";
import { updateLoanRequestStatusAction } from "../actions/update-loan-request-status.action";

type ReceivedLoanRequestsProps = {
  requests: ReceivedLoanRequest[];
};

export function ReceivedLoanRequests({ requests }: ReceivedLoanRequestsProps) {
  const t = useTranslation();

  return (
    <Card className="flex flex-1 flex-col">
      <CardHeader>
        <CardTitle>{t("requests.received.title")}</CardTitle>
        <CardDescription>{t("requests.received.description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {requests.length === 0 ? (
          <p className="flex flex-1 items-center text-sm text-muted-foreground">
            {t("requests.received.emptyState")}
          </p>
        ) : (
          <div className="flex flex-1 flex-col gap-4">
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
                      {t("requests.received.requesterLabel")}
                    </dt>
                    <dd>
                      {request.requester.name ??
                        request.requester.email ??
                        t("dashboard.userFallback")}
                    </dd>
                  </div>
                  {request.message ? (
                    <div>
                      <dt className="font-medium text-muted-foreground">
                        {t("requests.received.messageLabel")}
                      </dt>
                      <dd className="leading-6">{request.message}</dd>
                    </div>
                  ) : null}
                </dl>
                {request.status === "pending" ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <form action={updateLoanRequestStatusAction.bind(null, request.id, "accepted")}>
                      <Button size="sm" type="submit">
                        {t("requests.received.acceptLabel")}
                      </Button>
                    </form>
                    <form action={updateLoanRequestStatusAction.bind(null, request.id, "rejected")}>
                      <Button size="sm" type="submit" variant="outline">
                        {t("requests.received.rejectLabel")}
                      </Button>
                    </form>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
