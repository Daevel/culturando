import type * as React from "react";

import { cn } from "@/lib/utils";

type SkeletonGridColumnCount = 1 | 2 | 3 | 4 | 5 | 6;

type SkeletonGridColumns =
  | SkeletonGridColumnCount
  | Partial<Record<"base" | "sm" | "md" | "lg" | "xl", SkeletonGridColumnCount>>;

const baseGridColumns: Record<SkeletonGridColumnCount, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

const responsiveGridColumns = {
  sm: {
    1: "sm:grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-4",
    5: "sm:grid-cols-5",
    6: "sm:grid-cols-6",
  },
  md: {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
    6: "md:grid-cols-6",
  },
  lg: {
    1: "lg:grid-cols-1",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    5: "lg:grid-cols-5",
    6: "lg:grid-cols-6",
  },
  xl: {
    1: "xl:grid-cols-1",
    2: "xl:grid-cols-2",
    3: "xl:grid-cols-3",
    4: "xl:grid-cols-4",
    5: "xl:grid-cols-5",
    6: "xl:grid-cols-6",
  },
} satisfies Record<"sm" | "md" | "lg" | "xl", Record<SkeletonGridColumnCount, string>>;

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("animate-pulse rounded-md bg-primary/10", className)} {...props} />;
}

function BookCoverSkeletonCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn("relative h-full rounded-lg border bg-card p-3 shadow-sm", className)}
      {...props}
    >
      <Skeleton className="absolute inset-y-5 left-3 w-3 rounded-l-md bg-primary/15" />
      <div className="relative ml-3 flex min-h-[29rem] overflow-hidden rounded-md border bg-gradient-to-br from-primary/10 via-card to-secondary/30 shadow-md">
        <Skeleton className="w-4 shrink-0 rounded-none border-r bg-primary/15" />

        <div className="flex flex-1 flex-col justify-between p-5">
          <div className="flex justify-between gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-14" />
          </div>

          <div className="mx-auto flex w-full max-w-[15rem] flex-col items-center gap-4 py-8">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-4/5" />
            <Skeleton className="h-px w-16 rounded-none bg-primary/30" />
            <Skeleton className="h-4 w-28" />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookCoverSkeletonGrid({
  className,
  columns = { base: 1, md: 2, xl: 3 },
  rows = 2,
  ...props
}: React.ComponentProps<"div"> & {
  columns?: SkeletonGridColumns;
  rows?: number;
}) {
  const itemCount = getSkeletonGridItemCount(rows, columns);
  const skeletonItems = Array.from(
    { length: itemCount },
    (_, index) => `book-cover-skeleton-${index + 1}`,
  );

  return (
    <div className={cn("grid gap-4", getSkeletonGridColumnClasses(columns), className)} {...props}>
      {skeletonItems.map((item) => (
        <BookCoverSkeletonCard key={item} />
      ))}
    </div>
  );
}

function getSkeletonGridColumnClasses(columns: SkeletonGridColumns) {
  if (typeof columns === "number") {
    return baseGridColumns[columns];
  }

  return [
    baseGridColumns[columns.base ?? 1],
    columns.sm ? responsiveGridColumns.sm[columns.sm] : null,
    columns.md ? responsiveGridColumns.md[columns.md] : null,
    columns.lg ? responsiveGridColumns.lg[columns.lg] : null,
    columns.xl ? responsiveGridColumns.xl[columns.xl] : null,
  ];
}

function getSkeletonGridItemCount(rows: number, columns: SkeletonGridColumns) {
  const safeRows = Math.max(1, Math.floor(rows));
  const columnCount =
    typeof columns === "number"
      ? columns
      : Math.max(
          1,
          ...Object.values(columns).filter(
            (value): value is SkeletonGridColumnCount => value !== undefined,
          ),
        );

  return safeRows * columnCount;
}

export { BookCoverSkeletonCard, BookCoverSkeletonGrid, Skeleton };
