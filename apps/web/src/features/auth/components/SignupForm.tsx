import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { routes } from "@/config/routes";
import { authCopy } from "../constants/auth-copy";

export function SignupForm() {
  return (
    <form className="flex w-full max-w-sm flex-col gap-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{authCopy.signup.title}</h1>
        <p className="text-sm text-muted-foreground">{authCopy.signup.description}</p>
      </div>

      <div className="flex flex-col gap-y-4">
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" type="text" placeholder="Luigi Avitabile" />
        </div>

        <div className="flex flex-col gap-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="nome@email.com" />
        </div>

        <div className="flex flex-col gap-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" placeholder="••••••••" />
        </div>

        <div className="flex flex-col gap-y-2">
          <Label htmlFor="confirmPassword">Conferma password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
          />
        </div>
      </div>

      <div className="flex flex-col gap-y-3">
        <Button type="submit">{authCopy.signup.submitLabel}</Button>

        <p className="text-center text-sm text-muted-foreground">
          {authCopy.signup.alternativeLabel}
        </p>

        <Button asChild type="button" variant="secondary">
          <Link href={routes.login}>{authCopy.signup.secondaryActionLabel}</Link>
        </Button>
      </div>
    </form>
  );
}
