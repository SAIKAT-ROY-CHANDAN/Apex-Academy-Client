"use client";

import { CalendarDays, RefreshCw } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ExpenseReportFiltersProps {
  selectedFrom: string;
  selectedTo: string;
}

export function ExpenseReportFilters({
  selectedFrom,
  selectedTo,
}: ExpenseReportFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [from, setFrom] = useState(selectedFrom);
  const [to, setTo] = useState(selectedTo);
  const [error, setError] = useState("");

  // Re-sync draft with the URL (browser back/forward, reset) so the
  // visible dates always match the actually applied filter.
  useEffect(() => {
    setFrom(selectedFrom);
    setTo(selectedTo);
    setError("");
  }, [selectedFrom, selectedTo]);

  const handleApply = () => {
    if (from && to && to < from) {
      setError("To date cannot be before From date");
      return;
    }
    setError("");

    const params = new URLSearchParams(searchParams.toString());

    if (from) {
      params.set("from_date", from);
    } else {
      params.delete("from_date");
    }

    if (to) {
      params.set("to_date", to);
    } else {
      params.delete("to_date");
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
    router.refresh();
  };

  const handleReset = () => {
    setFrom("");
    setTo("");
    setError("");
    router.push(pathname);
    router.refresh();
  };

  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        handleApply();
      }}
      noValidate
    >
      <div className="space-y-1.5">
        <label
          htmlFor="expense-from-date"
          className="text-xs font-medium text-slate-500"
        >
          From Date
        </label>
        <div className="relative">
          <CalendarDays className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="expense-from-date"
            type="date"
            value={from}
            max={to || undefined}
            onChange={(e) => setFrom(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="expense-to-date"
          className="text-xs font-medium text-slate-500"
        >
          To Date
        </label>
        <div className="relative">
          <CalendarDays className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="expense-to-date"
            type="date"
            value={to}
            min={from || undefined}
            onChange={(e) => setTo(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Button type="submit" size="sm">
        Apply Filter
      </Button>

      <Button onClick={handleReset} variant="outline" size="sm" type="button">
        <RefreshCw />
        Reset
      </Button>

      {error ? (
        <p className="w-full text-xs text-destructive">{error}</p>
      ) : null}
    </form>
  );
}
