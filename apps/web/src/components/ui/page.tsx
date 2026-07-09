import type * as React from "react";

import { cn } from "@/lib/utils";

type PageContainerSize = "sm" | "md" | "lg" | "xl";

const pageContainerSizes: Record<PageContainerSize, string> = {
  sm: "max-w-3xl",
  md: "max-w-4xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
};

function PageShell({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      className={cn(
        "min-h-screen bg-background px-[var(--page-padding-x)] py-[var(--page-padding-y)] text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function PageContainer({
  className,
  size = "lg",
  ...props
}: React.ComponentProps<"section"> & { size?: PageContainerSize }) {
  return (
    <section
      className={cn(
        "mx-auto flex w-full flex-col gap-y-[var(--section-gap)]",
        pageContainerSizes[size],
        className,
      )}
      {...props}
    />
  );
}

function PageHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col justify-between gap-4 md:flex-row md:items-start", className)}
      {...props}
    />
  );
}

function PageHeaderContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("space-y-3", className)} {...props} />;
}

function PageEyebrow({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function PageTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      className={cn(
        "max-w-3xl font-serif text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl",
        className,
      )}
      {...props}
    />
  );
}

function PageDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg", className)}
      {...props}
    />
  );
}

function ResponsiveActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap", className)}
      {...props}
    />
  );
}

export {
  PageContainer,
  PageDescription,
  PageEyebrow,
  PageHeader,
  PageHeaderContent,
  PageShell,
  PageTitle,
  ResponsiveActions,
};
