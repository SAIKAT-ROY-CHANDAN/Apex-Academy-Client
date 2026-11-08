import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton shown while the teacher's routine and period settings load, so the
 * page never renders as a blank screen.
 */
export default function ClassRoutineLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6" aria-busy="true">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-11 w-24 rounded-xl" />
            <Skeleton className="h-11 w-24 rounded-xl" />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {["week", "today", "next"].map((card) => (
            <Skeleton key={card} className="h-24 rounded-2xl" />
          ))}
        </div>

        <div className="flex gap-3">
          <Skeleton className="h-11 w-44 rounded-2xl" />
          <Skeleton className="h-11 w-72 rounded-xl" />
        </div>

        <Skeleton className="h-[28rem] rounded-2xl" />
      </div>
    </div>
  );
}
