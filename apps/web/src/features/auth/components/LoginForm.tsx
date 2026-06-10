import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { routes } from "@/config/routes";
import { authCopy } from "../constants/auth-copy";

export function LoginForm() {
  return (
    <form className="flex w-full max-w-sm flex-col gap-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{authCopy.login.title}</h1>
        <p className="text-sm text-muted-foreground">{authCopy.login.description}</p>
      </div>

      <div className="flex flex-col gap-y-4">
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="nome@email.com" />
        </div>

        <div className="flex flex-col gap-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" placeholder="••••••••" />
        </div>
      </div>

      <div className="flex items-center gap-x-2">
        <Input id="rememberMe" name="rememberMe" type="checkbox" className="h-4 w-4" />
        <Label htmlFor="rememberMe">Remember me</Label>
      </div>

      <div className="flex flex-col gap-y-3">
        <Button type="submit">{authCopy.login.submitLabel}</Button>

        <p className="text-center text-sm text-muted-foreground">
          {authCopy.login.alternativeLabel}
        </p>

        <Button asChild type="button" variant="secondary">
          <Link href={routes.signup}>{authCopy.login.secondaryActionLabel}</Link>
        </Button>
      </div>
    </form>
  );
}
