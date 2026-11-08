import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; direction: "up" | "down" };
};

export function StatCard({ label, value, icon: Icon, trend }: StatCardProps) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="flex items-center justify-between p-5">
        <div className="space-y-1">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-semibold text-slate-900">{value}</p>
          {trend && (
            <p
              className={cn(
                "text-xs font-medium",
                trend.direction === "up" ? "text-emerald-600" : "text-red-600",
              )}
            >
              {trend.direction === "up" ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100">
          <Icon className="h-5 w-5 text-slate-700" />
        </div>
      </CardContent>
    </Card>
  );
}
