import { confirmEmailVerificationToken } from "@/features/auth/actions/email-verification";
import { EmailConfirmationPage } from "@/features/auth/components/EmailConfirmationPage";

type VerifyEmailPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return <EmailConfirmationPage status="missing-token" />;
  }

  const result = await confirmEmailVerificationToken(token);

  return <EmailConfirmationPage status={result.status} />;
}
