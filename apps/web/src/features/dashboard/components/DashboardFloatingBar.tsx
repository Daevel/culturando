"use client";

import { BookOpen, LayoutDashboard, LogOut, Menu, Plus, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import { useState } from "react";

import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { TooltipProvider } from "@/components/ui/tooltip";
import { routes } from "@/config/routes";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

type DashboardFloatingBarProps = {
  logoutAction: () => Promise<void>;
  user: NonNullable<Session["user"]>;
};

type DashboardNavLink = {
  href: string;
  icon: typeof LayoutDashboard;
  label: string;
};

export function DashboardFloatingBar({ logoutAction, user }: DashboardFloatingBarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslation();

  if (pathname === routes.login || pathname === routes.signup) {
    return null;
  }

  const displayName = user.name ?? user.email ?? t("dashboard.userFallback");
  const initials = getInitials(displayName);
  const links = [
    {
      href: routes.dashboard,
      icon: LayoutDashboard,
      label: t("dashboard.nav.dashboardLabel"),
    },
    {
      href: routes.books,
      icon: BookOpen,
      label: t("dashboard.nav.booksLabel"),
    },
    {
      href: routes.newBook,
      icon: Plus,
      label: t("dashboard.nav.newBookLabel"),
    },
  ];

  return (
    <TooltipProvider>
      <DesktopFloatingBar
        displayName={displayName}
        initials={initials}
        links={links}
        logoutAction={logoutAction}
        pathname={pathname}
        user={user}
      />

      <div className="sticky top-4 z-40 mx-auto mt-4 w-[calc(100%-2rem)] rounded-lg border border-border/70 bg-background/88 px-3 py-3 shadow-xl shadow-primary/5 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link
            aria-label={t("dashboard.nav.logoLabel")}
            className="flex min-w-0 items-center gap-2 rounded-full pr-3 font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
            href={routes.dashboard}
          >
            <BrandLogo className="size-10" variant="mark" />
            <span className="sr-only">Culturando</span>
          </Link>

          <Button
            aria-expanded={isMobileMenuOpen}
            aria-label={
              isMobileMenuOpen
                ? t("dashboard.nav.closeMobileMenuLabel")
                : t("dashboard.nav.openMobileMenuLabel")
            }
            className="size-10 shrink-0 rounded-md border-border/60 bg-muted/70"
            onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
            size="icon"
            type="button"
            variant="outline"
          >
            {isMobileMenuOpen ? (
              <X aria-hidden="true" className="size-5" />
            ) : (
              <Menu aria-hidden="true" className="size-5" />
            )}
          </Button>
        </div>
      </div>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-30 lg:hidden">
          <button
            aria-label={t("dashboard.nav.closeMobileMenuLabel")}
            className="absolute inset-0 bg-background/55 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
            type="button"
          />
          <aside className="absolute top-0 right-0 flex h-full w-[min(22rem,calc(100%-2rem))] flex-col gap-5 border-l bg-background p-5 shadow-2xl animate-in slide-in-from-right-6 duration-200 sm:rounded-l-lg">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <BrandLogo className="size-10" variant="mark" />
                <div className="min-w-0">
                  <p className="font-semibold">Culturando</p>
                  <p className="truncate text-sm text-muted-foreground">{displayName}</p>
                </div>
              </div>
              <Button
                aria-label={t("dashboard.nav.closeMobileMenuLabel")}
                className="size-9 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <X aria-hidden="true" className="size-5" />
              </Button>
            </div>

            <nav aria-label={t("dashboard.nav.primaryLabel")}>
              <ul className="space-y-2">
                {links.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;

                  return (
                    <li key={link.href}>
                      <Link
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-md border border-border/70 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:bg-muted hover:text-foreground",
                          isActive &&
                            "border-primary/30 bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                        )}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Icon aria-hidden="true" className="size-5" />
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="mt-auto space-y-3 border-t pt-5">
              <div className="flex items-center justify-between rounded-md border bg-muted/40 px-4 py-3">
                <span className="text-sm font-medium text-muted-foreground">
                  {t("dashboard.nav.themeLabel")}
                </span>
                <ThemeToggle
                  className="size-10 rounded-md border-border/60 bg-background"
                  darkLabel={t("dashboard.nav.activateDarkModeLabel")}
                  iconOnly
                  lightLabel={t("dashboard.nav.activateLightModeLabel")}
                />
              </div>

              <Link
                className="flex items-center gap-3 rounded-md border border-border/70 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:bg-muted hover:text-foreground"
                href={routes.dashboardProfile}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <UserRound aria-hidden="true" className="size-5" />
                {t("dashboard.nav.profileLabel")}
              </Link>

              <form action={logoutAction}>
                <Button
                  className="h-12 w-full justify-start gap-3 rounded-md px-4 text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                  type="submit"
                  variant="ghost"
                >
                  <LogOut aria-hidden="true" className="size-5" />
                  {t("dashboard.logoutLabel")}
                </Button>
              </form>
            </div>
          </aside>
        </div>
      ) : null}
    </TooltipProvider>
  );
}

function DesktopFloatingBar({
  displayName,
  initials,
  links,
  logoutAction,
  pathname,
  user,
}: {
  displayName: string;
  initials: string;
  links: DashboardNavLink[];
  logoutAction: () => Promise<void>;
  pathname: string;
  user: NonNullable<Session["user"]>;
}) {
  const t = useTranslation();

  return (
    <div className="sticky top-4 z-40 mx-auto mt-4 hidden w-[calc(100%-2rem)] max-w-6xl rounded-lg border border-border/70 bg-background/88 px-4 py-3 shadow-xl shadow-primary/5 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 lg:block">
      <div className="grid items-center gap-3 lg:grid-cols-[1fr_auto_1fr]">
        <Link
          aria-label={t("dashboard.nav.logoLabel")}
          className="flex items-center gap-2 rounded-full pr-3 font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
          href={routes.dashboard}
        >
          <BrandLogo className="size-10" variant="mark" />
          <span className="sr-only">Culturando</span>
        </Link>

        <nav aria-label={t("dashboard.nav.primaryLabel")}>
          <ul className="flex gap-2 overflow-x-auto">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <li className="shrink-0" key={link.href}>
                  <Link
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "inline-flex h-10 items-center gap-2 rounded-md border border-border/60 bg-background/70 px-4 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:border-primary/30 hover:bg-background hover:text-foreground",
                      isActive &&
                        "border-primary/30 bg-primary text-primary-foreground shadow-md hover:bg-primary hover:text-primary-foreground",
                    )}
                    href={link.href}
                  >
                    <Icon aria-hidden="true" className="size-4" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center justify-end gap-2 justify-self-end">
          <ThemeToggle
            className="size-10 rounded-md border-border/60 bg-muted/70"
            darkLabel={t("dashboard.nav.activateDarkModeLabel")}
            iconOnly
            lightLabel={t("dashboard.nav.activateLightModeLabel")}
          />
          <NavigationMenu viewport={false}>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="h-10 rounded-md bg-muted/70 px-2 pr-3 hover:bg-muted data-[state=open]:bg-muted">
                  <span className="grid size-7 place-items-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
                    {initials}
                  </span>
                  <span className="ml-2 max-w-32 truncate">{displayName}</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="absolute right-0 left-auto top-full mt-3 w-64 rounded-lg border bg-popover p-2 text-popover-foreground shadow-xl">
                  <div className="border-b px-3 py-2">
                    <p className="truncate text-sm font-semibold">{displayName}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <NavigationMenuLink asChild className="mt-2 flex items-center gap-2 rounded-md">
                    <Link href={routes.dashboardProfile}>
                      <UserRound aria-hidden="true" className="size-4" />
                      {t("dashboard.nav.profileLabel")}
                    </Link>
                  </NavigationMenuLink>
                  <form action={logoutAction}>
                    <Button
                      className="mt-1 h-auto w-full justify-start gap-2 rounded-md px-3 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                      type="submit"
                      variant="ghost"
                    >
                      <LogOut aria-hidden="true" className="size-4" />
                      {t("dashboard.logoutLabel")}
                    </Button>
                  </form>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </div>
  );
}

function getInitials(value: string) {
  return (
    value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.at(0)?.toUpperCase())
      .join("") || "C"
  );
}
