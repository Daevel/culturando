import { PageShell } from "@/components/ui/page";
import { SignupForm } from "@/features/auth/components/SignupForm";

export default function SignupPage() {
  return (
    <PageShell className="flex items-center justify-center">
      <SignupForm />
    </PageShell>
  );
}
