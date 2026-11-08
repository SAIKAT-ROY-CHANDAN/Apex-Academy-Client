"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDayLabel, getPalette, periodTimeLabel } from "../routine-data";
import type { TDayOfWeek, TNormalizedRoutine } from "../types";
import ClassCard from "./ClassCard";

type DayScheduleListProps = {
  normalized: TNormalizedRoutine;
  today: TDayOfWeek;
  /** Day the list is showing; the parent owns this so it can default to today. */
  selectedDay: TDayOfWeek;
  onSelectedDayChange: (day: TDayOfWeek) => void;
  currentPeriodNo: number | null;
  classFilter: string;
};

/**
 * Day view: a horizontal chip row picks the day (today by default) and the
 * periods render as a vertical timeline, so a free period still shows up as a
 * muted row and the day reads as a whole.
 */
export default function DayScheduleList({
  normalized,
  today,
  selectedDay,
  onSelectedDayChange,
  currentPeriodNo,
  classFilter,
}: DayScheduleListProps) {
  const { periods, days, byDay, conflictKeys } = normalized;
  const matchesFilter = (classKey: string) =>
    classFilter === "all" || classFilter === classKey;

  return (
    <>
      <Tabs
        value={selectedDay}
        onValueChange={(value) => onSelectedDayChange(value as TDayOfWeek)}
      >
        <TabsList className="h-auto w-full justify-start gap-1.5 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-100/70 p-1.5">
          {days.map((day) => (
            <TabsTrigger
              key={day}
              value={day}
              className="h-auto shrink-0 gap-1.5 rounded-xl px-3 py-2 text-sm"
            >
              <span>{formatDayLabel(day)}</span>
              {day === today ? (
                <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[0.625rem] font-semibold text-white">
                  Today
                </span>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>

        {days.map((day) => {
          const slots = byDay[day] ?? {};
          const dayTotal = periods.reduce(
            (sum, period) => sum + (slots[period.periodNo]?.length ?? 0),
            0,
          );

          return (
            <TabsContent key={day} value={day} className="mt-4 outline-none">
              <p className="mb-3 text-xs text-muted-foreground">
                {dayTotal === 0
                  ? `No classes on ${formatDayLabel(day)}`
                  : `${dayTotal} ${dayTotal === 1 ? "class" : "classes"} on ${formatDayLabel(day)}`}
              </p>

              <ol className="space-y-2">
                {periods.map((period) => {
                  const entries = slots[period.periodNo] ?? [];
                  const timeLabel = periodTimeLabel(period);
                  const hasConflict = conflictKeys.has(
                    `${day}|${period.periodNo}`,
                  );
                  const isNow =
                    day === today && currentPeriodNo === period.periodNo;

                  return (
                    <li
                      key={period.periodNo}
                      className={[
                        "flex items-stretch gap-3 rounded-2xl border p-3",
                        isNow
                          ? "border-blue-300 bg-blue-50/60 ring-1 ring-blue-200"
                          : "border-slate-200 bg-white",
                      ].join(" ")}
                    >
                      {/* Left: period label and time */}
                      <div className="w-24 shrink-0 sm:w-28">
                        <p className="text-sm font-semibold text-slate-800">
                          {period.label}
                        </p>
                        <p className="mt-0.5 text-[0.6875rem] leading-tight text-slate-500">
                          {timeLabel || "—"}
                        </p>
                        {isNow ? (
                          <span className="mt-1.5 inline-block rounded-full bg-blue-600 px-2 py-0.5 text-[0.625rem] font-semibold tracking-wide text-white uppercase">
                            Now
                          </span>
                        ) : null}
                      </div>

                      {/* Right: the classes, or a muted free row */}
                      <div className="min-w-0 flex-1">
                        {entries.length === 0 ? (
                          <p className="py-1 text-sm text-slate-400 italic">
                            Free
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {entries.map((entry) => (
                              <ClassCard
                                key={entry.key}
                                entry={entry}
                                hasConflict={hasConflict}
                                dimmed={!matchesFilter(entry.classKey)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </TabsContent>
          );
        })}
      </Tabs>

      <ClassLegend classes={normalized.classes} />
    </>
  );
}

function ClassLegend({ classes }: { classes: TNormalizedRoutine["classes"] }) {
  if (classes.length < 2) return null;

  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
      <p className="mb-2.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
        Classes this week
      </p>
      <ul className="flex flex-wrap gap-2">
        {classes.map((classOption) => {
          const palette = getPalette(classOption.colorIndex);
          return (
            <li key={classOption.key}>
              <span
                className={[
                  "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-medium",
                  palette.soft,
                  palette.border,
                  palette.text,
                ].join(" ")}
              >
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 shrink-0 rounded-full ${palette.dot}`}
                />
                {classOption.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
