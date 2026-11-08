"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CalendarDays, RefreshCw } from "lucide-react";

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

const MONTHS = [
  { value: "", label: "All Months" },
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

interface DepositReportFiltersProps {
  selectedYear: string;
  selectedMonth: string;
}

export function DepositReportFilters({
  selectedYear,
  selectedMonth,
}: DepositReportFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [year, setYear] = useState(selectedYear);
  const [month, setMonth] = useState(selectedMonth);

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (year) {
      params.set("year", year);
    } else {
      params.delete("year");
    }

    if (month) {
      params.set("month", month);
    } else {
      params.delete("month");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleReset = () => {
    setYear("");
    setMonth("");
    router.push(pathname);
  };

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-500">Year</label>
        <Select value={year} onValueChange={(value) => setYear(value ?? "")}>
          <SelectTrigger className="justify-between gap-2">
            <CalendarDays />
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-500">Month</label>
        <Select value={month} onValueChange={(value) => setMonth(value ?? "")}>
          <SelectTrigger className="justify-between gap-2">
            <CalendarDays />
            <SelectValue placeholder="All months" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleApply} size="sm">
        Apply Filter
      </Button>

      <Button
        onClick={handleReset}
        variant="outline"
        size="sm"
        type="button"
      >
        <RefreshCw />
        Reset
      </Button>
    </div>
  );
}