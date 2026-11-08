"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getCalendarHolidays } from "@/services/holiday";
import {
  buildHolidayMap,
  buildMonthGrid,
  type ICalendarCell,
  type ICalendarHoliday,
  normalizeWeekendDays,
  toDayKey,
} from "@/utils/academicCalendar";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const HOLIDAY_TYPE_LABELS: Record<string, string> = {
  PUBLIC: "Government Holiday",
  ACADEMIC: "Academic Holiday",
  INSTITUTIONAL: "Institution Holiday",
  EMERGENCY: "Emergency Holiday",
};

interface AcademicCalendarProps {
  weekendDays: unknown;
  initialHolidays: ICalendarHoliday[];
}

const AcademicCalendar = ({
  weekendDays,
  initialHolidays,
}: AcademicCalendarProps) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const [viewYear, setViewYear] = useState(currentYear);
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [todayKey, setTodayKey] = useState<string | null>(null);
  const [holidaysByYear, setHolidaysByYear] = useState<
    Map<number, ICalendarHoliday[]>
  >(() => new Map([[now.getFullYear(), initialHolidays]]));
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const today = new Date();
    setTodayKey(
      toDayKey(today.getFullYear(), today.getMonth(), today.getDate()),
    );
  }, []);

  useEffect(() => {
    if (holidaysByYear.has(viewYear)) return;

    startTransition(async () => {
      const response = await getCalendarHolidays(viewYear);
      const holidays: ICalendarHoliday[] = response?.success
        ? (response.data ?? [])
        : [];
      setHolidaysByYear((prev) => new Map(prev).set(viewYear, holidays));
    });
  }, [viewYear, holidaysByYear]);

  const weekendDayIndexes = useMemo(
    () => normalizeWeekendDays(weekendDays),
    [weekendDays],
  );

  const holidayMap = useMemo(
    () => buildHolidayMap(holidaysByYear.get(viewYear) ?? []),
    [holidaysByYear, viewYear],
  );

  const weeks = useMemo(
    () =>
      buildMonthGrid(
        viewYear,
        viewMonth,
        weekendDayIndexes,
        holidayMap,
        todayKey,
      ),
    [viewYear, viewMonth, weekendDayIndexes, holidayMap, todayKey],
  );

  const goToPrevMonth = () => {
    setViewMonth((month) => {
      if (month === 0) {
        setViewYear((year) => year - 1);
        return 11;
      }
      return month - 1;
    });
  };

  const goToNextMonth = () => {
    setViewMonth((month) => {
      if (month === 11) {
        setViewYear((year) => year + 1);
        return 0;
      }
      return month + 1;
    });
  };

  const goToToday = () => {
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
  };

  const yearOptions = useMemo(() => {
    const minYear = Math.min(currentYear - 10, viewYear - 1);
    const maxYear = Math.max(currentYear + 10, viewYear + 1);
    const years: number[] = [];
    for (let year = minYear; year <= maxYear; year++) {
      years.push(year);
    }
    return years;
  }, [viewYear, currentYear]);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-semibold text-gray-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <CalendarDays className="h-4.5 w-4.5" strokeWidth={2} />
          </span>
          Academic Calendar
        </h3>
        <button
          type="button"
          onClick={goToToday}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
        >
          Today
        </button>
      </div>

      {/* Navigation */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={goToPrevMonth}
          aria-label="Previous month"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex flex-1 items-center justify-center gap-2">
          <select
            aria-label="Select month"
            value={viewMonth}
            onChange={(event) => setViewMonth(Number(event.target.value))}
            className="w-28 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm font-medium text-gray-700 outline-none transition-colors focus:border-blue-400"
          >
            {MONTH_NAMES.map((name, index) => (
              <option key={name} value={index}>
                {name}
              </option>
            ))}
          </select>
          <select
            aria-label="Select year"
            value={viewYear}
            onChange={(event) => setViewYear(Number(event.target.value))}
            className="w-20 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm font-medium text-gray-700 outline-none transition-colors focus:border-blue-400"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={goToNextMonth}
          aria-label="Next month"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 border-b border-gray-100 pb-2">
        {WEEKDAY_LABELS.map((label, index) => (
          <div
            key={label}
            className={cn(
              "text-center text-[11px] font-semibold tracking-wide uppercase",
              weekendDayIndexes.includes(index)
                ? "text-rose-400"
                : "text-gray-400",
            )}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <TooltipProvider delay={150}>
        <div
          className={cn(
            "mt-2 grid grid-cols-7 gap-1 transition-opacity",
            isPending && "opacity-50",
          )}
        >
          {weeks.flat().map((cell) => (
            <CalendarCell key={cell.key} cell={cell} />
          ))}
        </div>
      </TooltipProvider>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gray-100 pt-3 text-[11px] text-gray-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          Today
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          Weekend
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          Government Holiday
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          Institution Holiday
        </span>
      </div>
    </div>
  );
};

const DAY_CELL_STYLES: Record<ICalendarCell["status"], string> = {
  working: "text-gray-700 hover:bg-gray-100",
  weekend: "bg-rose-50 text-rose-400 hover:bg-rose-100",
  "institution-holiday":
    "bg-amber-50 font-medium text-amber-600 hover:bg-amber-100",
  "government-holiday": "bg-red-50 font-semibold text-red-500 hover:bg-red-100",
};

function CalendarCell({ cell }: { cell: ICalendarCell }) {
  const dayLabel = (
    <span
      className={cn(
        "relative flex h-9 w-full items-center justify-center rounded-xl text-sm transition-colors sm:h-9",
        !cell.inMonth && "text-gray-300",
        cell.inMonth && DAY_CELL_STYLES[cell.status],
        cell.isToday &&
          "!bg-blue-500 font-semibold !text-white shadow-sm hover:!bg-blue-600",
      )}
    >
      {cell.day}
    </span>
  );

  const tooltipTitle =
    cell.holiday?.title ??
    (!cell.inMonth
      ? undefined
      : cell.status === "weekend"
        ? "Weekend"
        : undefined);
  const tooltipType = cell.holiday
    ? (HOLIDAY_TYPE_LABELS[cell.holiday.type] ?? "Holiday")
    : cell.status === "weekend"
      ? "Weekly Holiday"
      : undefined;

  if (!cell.inMonth || (!tooltipTitle && cell.status === "working")) {
    return (
      <div className="flex items-center justify-center" title={tooltipTitle}>
        {dayLabel}
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div className="flex cursor-default items-center justify-center" />
        }
      >
        {dayLabel}
      </TooltipTrigger>
      <TooltipContent className="flex-col items-start gap-0.5">
        <span className="font-semibold">{tooltipTitle}</span>
        {tooltipType && <span className="opacity-80">{tooltipType}</span>}
        {cell.holiday?.description && (
          <span className="max-w-45 opacity-70">
            {cell.holiday.description}
          </span>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export default AcademicCalendar;
