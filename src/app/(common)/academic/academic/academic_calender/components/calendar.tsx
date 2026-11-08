"use client";

import { useMemo, useState } from "react";
type HolidayMap = Record<string, string>;
interface CalendarProps {
  initialMonth?: number;

  initialYear?: number;

  highlightDay?: number;

  holidays?: HolidayMap;

  showHeader?: boolean;
}

const WEEKDAYS = ["MON", "TUE", "WED", "THUR", "FRI", "SAT", "SUN"];
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

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toKey(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

// Monday-first day index: JS getDay() is 0=Sun..6=Sat, we want 0=Mon..6=Sun
function mondayIndex(jsDay: number) {
  return (jsDay + 6) % 7;
}

interface DayCell {
  date: number;
  monthOffset: -1 | 0 | 1;
  key: string;
  isHighlightCol: boolean;
}

function buildMonthGrid(
  year: number,
  month: number,
  highlightDay: number,
): DayCell[] {
  const firstOfMonth = new Date(year, month, 1);
  const startPad = mondayIndex(firstOfMonth.getDay());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: DayCell[] = [];

  // Leading days from previous month
  for (let i = startPad - 1; i >= 0; i--) {
    const date = daysInPrevMonth - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    const jsDay = new Date(y, m, date).getDay();
    cells.push({
      date,
      monthOffset: -1,
      key: toKey(y, m, date),
      isHighlightCol:
        mondayIndex(jsDay) === mondayIndex(highlightDay) ||
        jsDay === highlightDay,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const jsDay = new Date(year, month, d).getDay();
    cells.push({
      date: d,
      monthOffset: 0,
      key: toKey(year, month, d),
      isHighlightCol: jsDay === highlightDay,
    });
  }

  const remainder = cells.length % 7;
  if (remainder !== 0) {
    const trailing = 7 - remainder;
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    for (let d = 1; d <= trailing; d++) {
      const jsDay = new Date(y, m, d).getDay();
      cells.push({
        date: d,
        monthOffset: 1,
        key: toKey(y, m, d),
        isHighlightCol: jsDay === highlightDay,
      });
    }
  }

  return cells;
}

export default function Calendar({
  initialMonth,
  initialYear,
  highlightDay = 5, // Friday
  holidays = {},
  showHeader = true,
}: CalendarProps) {
  const now = new Date();
  const [month, setMonth] = useState(initialMonth ?? now.getMonth());
  const [year, setYear] = useState(initialYear ?? now.getFullYear());

  const cells = useMemo(
    () => buildMonthGrid(year, month, highlightDay),
    [year, month, highlightDay],
  );

  const weeks = useMemo(() => {
    const rows: DayCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [cells]);

  function goPrev() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goNext() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  return (
    <div className="lg:max-w-4xl 2xl:max-w-6xl mx-auto px-4 md:px-0">
      {showHeader && (
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-gray-900 font-bebas">
            {MONTH_NAMES[month]} {year}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              aria-label="Previous month"
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 active:scale-95 transition"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M15 18l-6-6 6-6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={goNext}
              aria-label="Next month"
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 active:scale-95 transition"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M9 18l6-6-6-6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="w-full overflow-x-auto rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm">
        <div className="min-w-[560px]">
          {/* Weekday header row */}
          <div className="grid grid-cols-7">
            {WEEKDAYS.map((wd, i) => {
              const isFriCol = i === mondayIndex(highlightDay);
              return (
                <div
                  key={wd}
                  className={[
                    "px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-medium tracking-wide border-b border-gray-100 font-bebas",
                    isFriCol ? "text-red-500 bg-red-50/60" : "text-gray-400",
                  ].join(" ")}
                >
                  {wd}
                </div>
              );
            })}
          </div>

          {/* Weeks */}
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map((cell) => {
                const holidayLabel = holidays[cell.key];
                const isCurrentMonth = cell.monthOffset === 0;

                return (
                  <div
                    key={cell.key}
                    className={[
                      "relative min-h-[70px] sm:min-h-[100px] md:min-h-[120px] p-1.5 sm:p-3 border-b border-r border-gray-100 last:border-r-0",
                      cell.isHighlightCol
                        ? "bg-red-50/60"
                        : !isCurrentMonth
                          ? "bg-gray-50"
                          : "bg-white",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "text-xs sm:text-sm md:text-base font-medium font-bebas",
                        !isCurrentMonth
                          ? "text-gray-300"
                          : cell.isHighlightCol
                            ? "text-red-500"
                            : "text-gray-900",
                      ].join(" ")}
                    >
                      {pad(cell.date) ===
                        cell.date.toString().padStart(2, "0") &&
                      !isCurrentMonth &&
                      cell.date < 10
                        ? pad(cell.date)
                        : cell.date}
                    </span>

                    {holidayLabel && (
                      <span
                        className={[
                          "absolute bottom-1.5 left-1.5 sm:bottom-3 sm:left-3",
                          "text-[9px] sm:text-[11px] font-medium px-1.5 sm:px-2 py-0.5 rounded-full",
                          "bg-red-50 text-red-500 whitespace-nowrap font-bebas",
                        ].join(" ")}
                      >
                        {holidayLabel}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
