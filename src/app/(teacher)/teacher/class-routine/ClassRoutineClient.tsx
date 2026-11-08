"use client";

import {
  AlertTriangle,
  CalendarDays,
  LayoutGrid,
  ListOrdered,
  Printer,
  RefreshCw,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import PageRoute from "../components/dynamicRoute";
import ClassScheduleTable from "./components/classScheduleTable";
import DayScheduleList from "./components/DayScheduleList";
import {
  buildClassFilterOptions,
  countFilteredEntries,
  filterValueLabel,
  getCurrentPeriodNo,
  getFirstDayWithClasses,
  getToday,
  normalizeRoutine,
  resolveFilterValue,
  summarizeRoutine,
} from "./routine-data";
import type {
  TClassFilterOption,
  TDayOfWeek,
  TRawPeriodSetting,
  TRawRoutine,
  TRoutineSummary,
  TViewMode,
} from "./types";

const ALL_CLASSES = "all";
const ALL_CLASSES_LABEL = "All classes";

/** Stands in for "now" until the browser clock is read. */
const BEFORE_MIDNIGHT = new Date("1970-01-01T00:00:00Z");

type ClassRoutineClientProps = {
  routines: TRawRoutine[];
  periodSetting: TRawPeriodSetting | null;
  /** Set when the routine request failed; the page shows an error state. */
  loadError: string | null;
  /** Today's week day, resolved on the server so the first paint is complete. */
  initialToday: TDayOfWeek;
};

export default function ClassRoutineClient({
  routines,
  periodSetting,
  loadError,
  initialToday,
}: ClassRoutineClientProps) {
  const router = useRouter();

  const [view, setView] = useState<TViewMode>("week");
  const [isCompact, setIsCompact] = useState(false);
  const [selectedDay, setSelectedDay] = useState<TDayOfWeek | null>(null);
  const [classFilter, setClassFilter] = useState<string>(ALL_CLASSES);
  // Seeded from the server so the grid paints on the first frame, then
  // corrected to the browser's timezone after mount.
  const [today, setToday] = useState<TDayOfWeek>(initialToday);
  const [now, setNow] = useState<Date | null>(null);

  /**
   * "Today" and the current time are only reliable in the browser, so they are
   * re-read after mount and the clock ticks every minute. The initial render
   * uses the values the server passed down, which keeps hydration stable.
   */
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const sync = () => {
      setIsCompact(mql.matches);
      // The week grid needs horizontal room, so phones get the day list.
      setView(mql.matches ? "day" : "week");
    };
    sync();

    const tick = () => {
      const current = new Date();
      setNow(current);
      setToday(getToday(current));
    };
    tick();

    const timer = window.setInterval(tick, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const normalized = useMemo(
    () => normalizeRoutine(routines, periodSetting),
    [routines, periodSetting],
  );

  // Default the day chips to today, or to the first day that has classes when
  // the institute does not teach today.
  useEffect(() => {
    if (selectedDay) return;
    if (!normalized.days.length) return;
    const fallback = getFirstDayWithClasses(normalized, today);
    if (fallback) setSelectedDay(fallback);
  }, [selectedDay, normalized, today]);

  const currentPeriodNo = now
    ? getCurrentPeriodNo(normalized.periods, now)
    : null;

  // Before the clock is known, "next class" falls back to the first class of
  // the day, which is what the first frame should show anyway.
  const summary = useMemo(
    () => summarizeRoutine(normalized, today, now ?? BEFORE_MIDNIGHT),
    [normalized, today, now],
  );

  const showWeekView = view === "week" && !isCompact;

  // ---- Class filter ----
  // The options are memoized so their identity is stable, and the selected id
  // is re-validated on every render: if it is not one of the current options
  // (the teacher's classes changed) it falls back to "all", which means a raw
  // id can never reach the screen.
  const filterOptions: TClassFilterOption[] = useMemo(
    () =>
      buildClassFilterOptions(
        normalized.classes,
        ALL_CLASSES,
        ALL_CLASSES_LABEL,
      ),
    [normalized.classes],
  );
  const activeFilter = resolveFilterValue(
    classFilter,
    filterOptions,
    ALL_CLASSES,
  );
  const activeFilterLabel = filterValueLabel(
    activeFilter,
    filterOptions,
    ALL_CLASSES_LABEL,
  );
  const isFiltered = activeFilter !== ALL_CLASSES;
  // With a single routine there is nothing to choose between.
  const canFilter = normalized.classes.length > 1;
  const visibleEntryCount = countFilteredEntries(
    normalized,
    activeFilter,
    ALL_CLASSES,
  );
  const filterSelectId = useId();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/teacher");
    }
  };

  const hasClasses = normalized.entries.length > 0;

  return (
    <TooltipProvider delay={150}>
      {/* Print rules: landscape page, keep the colours, nothing sticky. */}
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
          html, body { background: #ffffff !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .routine-print-area {
            max-height: none !important;
            overflow: visible !important;
            height: auto !important;
            border: 0 !important;
            box-shadow: none !important;
          }
          .routine-print-area thead th,
          .routine-print-area tbody th { position: static !important; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageRoute
              title="Class Routine"
              breadcrumbs={[
                { label: "Overview", href: "/teacher" },
                { label: "Class-Routine" },
              ]}
            />
            <div className="print:hidden flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="flex w-fit items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-600 transition-all duration-200 hover:bg-blue-100"
              >
                <FaArrowLeft className="h-4 w-4" />
                Back
              </button>

              <Button
                type="button"
                variant="outline"
                onClick={() => window.print()}
                disabled={!hasClasses}
                className="rounded-xl"
              >
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          </div>

          {loadError ? (
            <ErrorState message={loadError} onRetry={() => router.refresh()} />
          ) : !hasClasses ? (
            <EmptyState />
          ) : (
            <>
              <SummaryRow summary={summary} />

              {/* View toggle + filter */}
              <div className="print:hidden flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <fieldset className="inline-flex w-fit rounded-2xl border border-slate-200 bg-white p-1">
                  <legend className="sr-only">Schedule view</legend>
                  <ViewButton
                    active={view === "week"}
                    disabled={isCompact}
                    title={
                      isCompact
                        ? "The week grid needs a wider screen - use the day list here"
                        : undefined
                    }
                    onClick={() => setView("week")}
                    icon={<LayoutGrid className="h-4 w-4" />}
                    label="Week"
                  />
                  <ViewButton
                    active={view === "day"}
                    onClick={() => setView("day")}
                    icon={<ListOrdered className="h-4 w-4" />}
                    label="Day"
                  />
                </fieldset>

                {canFilter ? (
                  <div className="w-full sm:w-[22rem] sm:max-w-full">
                    <Label
                      htmlFor={filterSelectId}
                      className="mb-1 block text-sm font-medium text-slate-900"
                    >
                      Filter by class
                    </Label>

                    <div className="flex items-center gap-2">
                      <Select
                        value={activeFilter}
                        onValueChange={(value) => {
                          if (value) setClassFilter(value);
                        }}
                        items={Object.fromEntries(
                          filterOptions.map((option) => [
                            option.value,
                            option.label,
                          ]),
                        )}
                      >
                        <SelectTrigger
                          id={filterSelectId}
                          title={activeFilterLabel}
                          className="h-10 w-full min-w-0 rounded-xl"
                        >
                          {/*
                            Base UI falls back to printing the raw value when it
                            cannot resolve a label, so the label is looked up
                            here and never left to chance.
                          */}
                          <SelectValue className="min-w-0 truncate">
                            {() => activeFilterLabel}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {filterOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {isFiltered ? (
                        <button
                          type="button"
                          onClick={() => setClassFilter(ALL_CLASSES)}
                          title="Clear the class filter"
                          aria-label="Clear the class filter"
                          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus-visible:outline-none"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                      <p className="text-xs text-muted-foreground">
                        Show only one class in the routine
                      </p>
                      <p className="text-xs font-medium text-slate-600">
                        Showing {visibleEntryCount} of{" "}
                        {normalized.entries.length}{" "}
                        {normalized.entries.length === 1 ? "class" : "classes"}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Print shows the active filter as text; the control is hidden. */}
              {canFilter ? (
                <p className="hidden text-sm font-medium text-slate-800 print:block">
                  Class: {activeFilterLabel}
                </p>
              ) : null}

              {/*
                The week grid stays mounted on every screen so Print always has
                it: `print:block` puts it back on the page while `hidden` keeps
                it off screen when another view is active.
              */}
              <div
                className={showWeekView ? "print:block" : "hidden print:block"}
              >
                <ClassScheduleTable
                  normalized={normalized}
                  today={today}
                  currentPeriodNo={currentPeriodNo}
                  classFilter={classFilter}
                />
              </div>

              {view === "day" ? (
                <div className="print:hidden">
                  {selectedDay ? (
                    <DayScheduleList
                      normalized={normalized}
                      today={today}
                      selectedDay={selectedDay}
                      onSelectedDayChange={setSelectedDay}
                      currentPeriodNo={currentPeriodNo}
                      classFilter={activeFilter}
                    />
                  ) : null}
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

function ViewButton({
  active,
  disabled,
  title,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  disabled?: boolean;
  title?: string;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
        active ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100",
        disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function SummaryRow({ summary }: { summary: TRoutineSummary | null }) {
  const next = summary?.next ?? null;

  return (
    <div className="print:hidden grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="flex items-center gap-2 text-xs font-medium tracking-wider text-slate-500 uppercase">
          <CalendarDays className="h-3.5 w-3.5" />
          This week
        </p>
        <p className="mt-1.5 text-2xl font-semibold text-slate-900">
          {summary?.totalWeek ?? 0}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {summary?.totalWeek === 1 ? "class" : "classes"}
          </span>
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="flex items-center gap-2 text-xs font-medium tracking-wider text-slate-500 uppercase">
          <CalendarDays className="h-3.5 w-3.5" />
          Today
        </p>
        <p className="mt-1.5 text-2xl font-semibold text-slate-900">
          {summary?.totalToday ?? 0}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {summary?.totalToday === 1 ? "class" : "classes"}
          </span>
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="flex items-center gap-2 text-xs font-medium tracking-wider text-slate-500 uppercase">
          <ListOrdered className="h-3.5 w-3.5" />
          Next class
        </p>
        {next ? (
          <div className="mt-1.5">
            <p className="truncate text-sm font-semibold text-slate-900">
              {next.subject}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {next.classLabel}
            </p>
            {next.roomNo ? (
              <p className="truncate text-xs text-muted-foreground">
                Room {next.roomNo}
              </p>
            ) : null}
            <p className="mt-0.5 text-xs text-blue-600">
              {summary?.nextPeriodLabel}
              {summary?.nextTimeLabel ? ` · ${summary.nextTimeLabel}` : ""}
            </p>
          </div>
        ) : (
          <p className="mt-1.5 text-sm text-muted-foreground">
            No more classes today
          </p>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
      <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />
      <p className="mt-4 text-base font-medium text-slate-800">
        No classes assigned yet
      </p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        Once an admin adds you to a class routine, your week and day timetables
        will appear here.
      </p>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50/60 px-6 py-14 text-center">
      <AlertTriangle className="mx-auto h-10 w-10 text-red-400" />
      <p className="mt-4 text-base font-medium text-red-800">
        Could not load your class routine
      </p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-red-700/80">{message}</p>
      <Button
        type="button"
        variant="outline"
        onClick={onRetry}
        className="mt-5 rounded-xl"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Retry
      </Button>
    </div>
  );
}
