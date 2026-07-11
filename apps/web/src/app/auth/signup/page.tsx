import { BrandLogo } from "@/components/BrandLogo";
import { PageShell } from "@/components/ui/page";
import { SignupForm } from "@/features/auth/components/SignupForm";

export default function SignupPage() {
  return (
    <PageShell className="flex items-center justify-center">
      <div className="flex w-full max-w-2xl flex-col items-center gap-6">
        <BrandLogo className="h-14 w-56" priority />
        <SignupForm />
      </div>
    </PageShell>
  );
}
