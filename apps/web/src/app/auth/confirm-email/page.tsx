import { confirmEmailVerificationToken } from "@/features/auth/actions/email-verification";
import { EmailConfirmationPage } from "@/features/auth/components/EmailConfirmationPage";

type ConfirmEmailPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ConfirmEmailPage({ searchParams }: ConfirmEmailPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return <EmailConfirmationPage success={false} />;
  }

  const result = await confirmEmailVerificationToken(token);

  return <EmailConfirmationPage success={result.success} />;
}
