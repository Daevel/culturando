import { getTranslation } from "@culturando/translation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer, PageDescription, PageShell, PageTitle } from "@/components/ui/page";
import { routes } from "@/config/routes";

export default function CheckEmailPage() {
  const t = getTranslation;

  return (
    <PageShell className="flex items-center">
      <PageContainer className="items-center text-center" size="sm">
        <div className="space-y-3">
          <PageTitle className="max-w-none lg:text-4xl">{t("auth.checkEmail.title")}</PageTitle>
          <PageDescription className="max-w-xl">{t("auth.checkEmail.description")}</PageDescription>
        </div>

        <Card className="w-full text-left">
          <CardHeader>
            <CardTitle>{t("auth.checkEmail.cardTitle")}</CardTitle>
            <CardDescription>{t("auth.checkEmail.cardDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full sm:w-auto">
              <Link href={routes.login}>{t("auth.checkEmail.loginLabel")}</Link>
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    </PageShell>
  );
}
