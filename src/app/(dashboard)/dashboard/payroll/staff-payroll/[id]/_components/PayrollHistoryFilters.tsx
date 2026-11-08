"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MONTHS } from "@/constant/payroll/teacher-payroll";
import { StaffPayrollHistorySummary } from "@/services/payroll/staff-payroll";
import { CalendarDays, WalletCards, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type PayrollHistoryFiltersProps = {
  currentFilters: { month?: string; year?: string };
  summary: StaffPayrollHistorySummary;
};

const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];
  for (let y = currentYear - 5; y <= currentYear + 1; y++)
    years.push(String(y));
  return years;
};

const PayrollHistoryFilters = ({
  currentFilters,
  summary,
}: PayrollHistoryFiltersProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams.toString());
    value ? newParams.set(key, value) : newParams.delete(key);
    newParams.delete("page");
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const hasFilters = currentFilters.month || currentFilters.year;

  return (
    <Card className="border-border shadow-sm">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Month
            </label>
            <Select
              value={currentFilters.month ?? "All"}
              onValueChange={(v) =>
                updateParam("month", v === "All" ? null : v)
              }
            >
              <SelectTrigger className="h-10 w-full rounded-xl border-border bg-background px-3 text-sm shadow-none sm:w-40">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Months</SelectItem>
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Year
            </label>
            <Select
              value={currentFilters.year ?? "All"}
              onValueChange={(v) => updateParam("year", v === "All" ? null : v)}
            >
              <SelectTrigger className="h-10 w-full rounded-xl border-border bg-background px-3 text-sm shadow-none sm:w-28">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Years</SelectItem>
              {getYearOptions().map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-10 gap-1.5 text-sm text-muted-foreground"
              onClick={() => router.push(pathname)}
              type="button"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:min-w-72">
          <div className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              Months paid
            </div>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {summary.totalMonthsPaid}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <WalletCards className="h-3.5 w-3.5" />
              Paid to date
            </div>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {new Intl.NumberFormat("en-BD", {
                style: "currency",
                currency: "BDT",
                maximumFractionDigits: 0,
              }).format(summary.totalAmountPaid)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PayrollHistoryFilters;
