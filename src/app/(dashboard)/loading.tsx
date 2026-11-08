import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-2">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* Filter / Search Bar Skeleton */}
      <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-9 w-64 rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
      </div>

      {/* Table / Content Card Skeleton */}
      <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-border/40">
          <Skeleton className="h-6 w-40 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
        <div className="space-y-3 pt-2">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md opacity-90" />
          <Skeleton className="h-12 w-full rounded-md opacity-80" />
          <Skeleton className="h-12 w-full rounded-md opacity-70" />
          <Skeleton className="h-12 w-full rounded-md opacity-60" />
        </div>
      </div>
    </div>
  );
}
