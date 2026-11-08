// _components/HostelSummaryCards.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { HostelDashboardSummary } from "@/services/hostel-report/hostel-report";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const currency = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

const HostelSummaryCards = ({
  summary,
  from,
  to,
}: {
  summary: HostelDashboardSummary;
  from?: string;
  to?: string;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const fromDate = from ? new Date(from) : undefined;
  const toDate = to ? new Date(to) : undefined;

  const updateParam = (key: "from" | "to", date: Date | undefined) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (date) {
      newParams.set(key, format(date, "yyyy-MM-dd"));
    } else {
      newParams.delete(key);
    }
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const clearRange = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("from");
    newParams.delete("to");
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const cards = [
    { label: "Total Collection", value: summary.totalCollection, className: "text-blue-600" },
    { label: "Total Expense", value: summary.totalExpense, className: "text-amber-600" },
    { label: "Total Due", value: summary.totalDue, className: "text-red-500" },
  ];

  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-stretch">
      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label} className="border-border/70 shadow-sm">
            <CardContent className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                {card.label}
              </p>
              <p className={`mt-0.5 text-lg font-bold sm:text-xl ${card.className}`}>
                {currency.format(card.value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-stretch gap-2 xl:w-72">
        <Popover open={fromOpen} onOpenChange={setFromOpen}>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                type="button"
                className={cn(
                  "h-9 flex-1 justify-start gap-1.5 rounded-lg border-border bg-background px-2.5 text-xs font-normal shadow-none",
                  !fromDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{fromDate ? format(fromDate, "d MMM") : "Start"}</span>
              </Button>
            }
          />
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={fromDate}
              onSelect={(date) => {
                updateParam("from", date);
                setFromOpen(false);
              }}
              disabled={toDate ? { after: toDate } : undefined}
            />
          </PopoverContent>
        </Popover>

        <Popover open={toOpen} onOpenChange={setToOpen}>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                type="button"
                className={cn(
                  "h-9 flex-1 justify-start gap-1.5 rounded-lg border-border bg-background px-2.5 text-xs font-normal shadow-none",
                  !toDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{toDate ? format(toDate, "d MMM") : "End"}</span>
              </Button>
            }
          />
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={toDate}
              onSelect={(date) => {
                updateParam("to", date);
                setToOpen(false);
              }}
              disabled={fromDate ? { before: fromDate } : undefined}
            />
          </PopoverContent>
        </Popover>

        {(fromDate || toDate) && (
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="h-9 w-9 shrink-0 rounded-lg text-muted-foreground"
            onClick={clearRange}
            title="Clear dates"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default HostelSummaryCards;