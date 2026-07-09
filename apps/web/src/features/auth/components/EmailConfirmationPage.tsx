import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer, PageDescription, PageShell, PageTitle } from "@/components/ui/page";
import { routes } from "@/config/routes";
import { useTranslation } from "@/hooks/useTranslation";

type EmailConfirmationPageProps = {
  success: boolean;
};

export function EmailConfirmationPage({ success }: EmailConfirmationPageProps) {
  const t = useTranslation();

  return (
    <PageShell className="flex items-center">
      <PageContainer className="items-center text-center" size="sm">
        <div className="space-y-3">
          <PageTitle className="max-w-none lg:text-4xl">
            {success ? t("auth.confirmEmail.success.title") : t("auth.confirmEmail.invalid.title")}
          </PageTitle>
          <PageDescription className="max-w-xl">
            {success
              ? t("auth.confirmEmail.success.description")
              : t("auth.confirmEmail.invalid.description")}
          </PageDescription>
        </div>

        <Card className="w-full text-left">
          <CardHeader>
            <CardTitle>
              {success
                ? t("auth.confirmEmail.success.cardTitle")
                : t("auth.confirmEmail.invalid.cardTitle")}
            </CardTitle>
            <CardDescription>
              {success
                ? t("auth.confirmEmail.success.cardDescription")
                : t("auth.confirmEmail.invalid.cardDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full sm:w-auto">
              <Link href={routes.login}>{t("auth.confirmEmail.loginLabel")}</Link>
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    </PageShell>
  );
}
