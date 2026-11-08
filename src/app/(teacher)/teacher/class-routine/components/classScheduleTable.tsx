"use client";

import { formatDayLabel, periodTimeLabel, slotKey } from "../routine-data";
import type { TDayOfWeek, TNormalizedRoutine } from "../types";
import ClassCard from "./ClassCard";

type ClassScheduleTableProps = {
  normalized: TNormalizedRoutine;
  today: TDayOfWeek;
  /** Period the clock is currently in, used for the "Now" marker. */
  currentPeriodNo: number | null;
  /** "all" or a classKey; entries of other classes are dimmed. */
  classFilter: string;
};

/**
 * Week view, transposed: rows are periods and columns are days, so a timetable
 * with any number of periods still fits the page. The table is fixed-layout and
 * full width, day columns share the remaining space equally, and every cell
 * wraps instead of clipping.
 */
export default function ClassScheduleTable({
  normalized,
  today,
  currentPeriodNo,
  classFilter,
}: ClassScheduleTableProps) {
  const { periods, days, byDay, conflictKeys } = normalized;
  const isToday = (day: TDayOfWeek) => day === today;
  const matchesFilter = (classKey: string) =>
    classFilter === "all" || classFilter === classKey;

  return (
    <div className="routine-print-area max-h-[72vh] overflow-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
        {/*
          The first column is fixed-width, the day columns split what is left
          equally. min-w keeps a day column legible if the viewport is tight -
          the wrapper scrolls rather than clipping.
        */}
        <colgroup>
          <col className="w-24 sm:w-32" />
          {days.map((day) => (
            <col key={day} className="min-w-[7.5rem]" />
          ))}
        </colgroup>

        <thead className="sticky top-0 z-30">
          <tr>
            <th
              scope="col"
              className="sticky left-0 z-40 border-b border-r-2 border-r-slate-300 bg-slate-100 px-3 py-3 text-left align-bottom text-xs font-semibold tracking-wider text-slate-500 uppercase"
            >
              Period
            </th>
            {days.map((day) => (
              <th
                key={day}
                scope="col"
                aria-current={isToday(day) ? "date" : undefined}
                className={[
                  "border-b border-r border-slate-200 px-2 py-3 text-center text-sm font-semibold last:border-r-0",
                  isToday(day)
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700",
                ].join(" ")}
              >
                <span className="block truncate">{formatDayLabel(day)}</span>
                {isToday(day) ? (
                  <span className="mt-0.5 block text-[0.6875rem] font-medium text-blue-100">
                    Today
                  </span>
                ) : null}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {periods.map((period) => {
            const timeLabel = periodTimeLabel(period);
            const isCurrentRow = currentPeriodNo === period.periodNo;

            return (
              <tr key={period.periodNo}>
                <th
                  scope="row"
                  className={[
                    "sticky left-0 z-20 border-b border-r-2 border-r-slate-300 bg-slate-50 px-3 py-2 text-left align-middle",
                    isCurrentRow ? "bg-blue-50" : "",
                  ].join(" ")}
                >
                  <span className="block text-sm font-semibold text-slate-800">
                    {period.label}
                  </span>
                  {timeLabel ? (
                    <span className="mt-0.5 block text-[0.6875rem] font-normal whitespace-nowrap text-slate-500">
                      {timeLabel}
                    </span>
                  ) : null}
                </th>

                {days.map((day) => {
                  const entries = byDay[day]?.[period.periodNo] ?? [];
                  const hasConflict = conflictKeys.has(
                    slotKey(day, period.periodNo),
                  );
                  const showNow = isToday(day) && isCurrentRow;

                  return (
                    <td
                      key={day}
                      className={[
                        "border-b border-r border-slate-200 px-2 py-2 align-top last:border-r-0",
                        isToday(day) ? "bg-blue-50/50" : "bg-white",
                      ].join(" ")}
                    >
                      {showNow ? (
                        <span className="mb-1 inline-block rounded-full bg-blue-600 px-2 py-0.5 text-[0.625rem] font-semibold tracking-wide text-white uppercase">
                          Now
                        </span>
                      ) : null}

                      {entries.length === 0 ? (
                        <span className="block py-1 text-center text-xs text-slate-300">
                          Free
                        </span>
                      ) : (
                        <div className="space-y-1.5">
                          {entries.map((entry) => (
                            <ClassCard
                              key={entry.key}
                              entry={entry}
                              compact
                              hasConflict={hasConflict}
                              dimmed={!matchesFilter(entry.classKey)}
                            />
                          ))}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
