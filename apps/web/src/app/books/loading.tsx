import {
  PageContainer,
  PageHeader,
  PageHeaderContent,
  PageShell,
  ResponsiveActions,
} from "@/components/ui/page";
import { BookCoverSkeletonGrid, Skeleton } from "@/components/ui/skeleton";

export default function BooksLoading() {
  return (
    <PageShell>
      <PageContainer size="xl">
        <PageHeader className="md:items-end">
          <PageHeaderContent>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-12 w-72 max-w-full" />
            <Skeleton className="h-6 w-[38rem] max-w-full" />
          </PageHeaderContent>
          <ResponsiveActions>
            <Skeleton className="h-10 w-full sm:w-40" />
          </ResponsiveActions>
        </PageHeader>

        <section className="grid gap-4 rounded-xl border bg-card p-4 shadow-sm md:grid-cols-[1fr_180px_180px] md:items-end">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
        </section>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-9 w-36" />
        </div>

        <BookCoverSkeletonGrid columns={{ base: 1, md: 2, xl: 3 }} rows={2} />
      </PageContainer>
    </PageShell>
  );
}
