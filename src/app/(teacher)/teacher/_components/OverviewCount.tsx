import {
  CalendarCheck,
  CalendarClock,
  CalendarX,
  Clock3,
  UserCheck,
  UserX,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getTeacherOverview } from "@/services/teacher";

type OverviewData = {
  totalApproveLeaves: number;
  totalPendingLeaves: number;
  totalRejectedLeaves: number;
  averageAttendancePercentage: number;
  averageAbsentPercentage: number;
  totalOvertimeHours: number;
};

const formatCount = (value?: number) =>
  new Intl.NumberFormat("en-US").format(value ?? 0);

const formatPercent = (value?: number) =>
  `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value ?? 0)}%`;

const formatHours = (value?: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value ?? 0);

const OverviewCount = async ({ teacherId }: { teacherId: string }) => {
  const overviewData = await getTeacherOverview(teacherId);
  const data: Partial<OverviewData> = overviewData?.data ?? {};

  const cards = [
    {
      label: "Approved Leaves",
      caption: "Total approved requests",
      value: formatCount(data.totalApproveLeaves),
      icon: CalendarCheck,
      iconBg: "bg-emerald-50 text-emerald-600",
      borderColor: "border-emerald-100",
      gradient: "from-emerald-50 to-emerald-100",
      accent: "bg-emerald-400",
    },
    {
      label: "Pending Leaves",
      caption: "Awaiting review",
      value: formatCount(data.totalPendingLeaves),
      icon: CalendarClock,
      iconBg: "bg-amber-50 text-amber-600",
      borderColor: "border-amber-100",
      gradient: "from-amber-50 to-amber-100",
      accent: "bg-amber-400",
    },
    {
      label: "Rejected Leaves",
      caption: "Total rejected requests",
      value: formatCount(data.totalRejectedLeaves),
      icon: CalendarX,
      iconBg: "bg-rose-50 text-rose-600",
      borderColor: "border-rose-100",
      gradient: "from-rose-50 to-rose-100",
      accent: "bg-rose-400",
    },
    {
      label: "Attendance Rate",
      caption: "Present vs total days",
      value: formatPercent(data.averageAttendancePercentage),
      icon: UserCheck,
      iconBg: "bg-sky-50 text-sky-600",
      borderColor: "border-sky-100",
      gradient: "from-sky-50 to-sky-100",
      accent: "bg-sky-400",
    },
    {
      label: "Absent Rate",
      caption: "Absences vs total days",
      value: formatPercent(data.averageAbsentPercentage),
      icon: UserX,
      iconBg: "bg-violet-50 text-violet-600",
      borderColor: "border-violet-100",
      gradient: "from-violet-50 to-violet-100",
      accent: "bg-violet-400",
    },
    {
      label: "Overtime Hours",
      caption: "Current month",
      value: formatHours(data.totalOvertimeHours),
      unit: "hrs",
      icon: Clock3,
      iconBg: "bg-orange-50 text-orange-600",
      borderColor: "border-orange-100",
      gradient: "from-orange-50 to-orange-100",
      accent: "bg-orange-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const animationDelay = `${index * 80}ms`;

        return (
          <div
            key={card.label}
            className={`group relative overflow-hidden rounded-2xl border ${card.borderColor} bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
            style={{ animationDelay }}
          >
            {/* Accent bar */}
            <div
              className={`absolute inset-x-0 top-0 h-1 ${card.accent} opacity-70 transition-opacity duration-300 group-hover:opacity-100`}
            />

            <div className="relative flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.iconBg} transition-transform duration-300 group-hover:scale-105`}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>

                {/* Gradient background overlay */}
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-60`}
                />
              </div>

              <div className="relative flex flex-col gap-0.5">
                <p className="text-3xl font-bold tracking-tight text-gray-900 tabular-nums">
                  {card.value}
                  {"unit" in card && card.unit && (
                    <span className="ml-1.5 text-base font-semibold text-gray-400">
                      {card.unit}
                    </span>
                  )}
                </p>
                <p className="text-sm font-semibold text-gray-700">
                  {card.label}
                </p>
                <p className="text-xs text-gray-400">{card.caption}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const OverviewCountSkeleton = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {[
      "approved",
      "pending",
      "rejected",
      "attendance",
      "absent",
      "overtime",
    ].map((id) => (
      <div
        key={id}
        className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
      >
        <Skeleton className="h-11 w-11 rounded-xl" />
        <Skeleton className="mt-4 h-9 w-24" />
        <Skeleton className="mt-2 h-4 w-32" />
        <Skeleton className="mt-1.5 h-3 w-24" />
      </div>
    ))}
  </div>
);

export default OverviewCount;
