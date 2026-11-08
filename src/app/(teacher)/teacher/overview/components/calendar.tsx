"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];

  // Leading days from previous month
  for (let i = startWeekday - 1; i >= 0; i--) {
    cells.push({
      day: daysInPrevMonth - i,
      currentMonth: false,
    });
  }

  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      currentMonth: true,
    });
  }

  // Trailing days from next month to complete the final week row
  const remainder = cells.length % 7;
  if (remainder !== 0) {
    const trailing = 7 - remainder;
    for (let d = 1; d <= trailing; d++) {
      cells.push({
        day: d,
        currentMonth: false,
      });
    }
  }

  return cells;
}

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

export default function Calendar() {
  const [viewDate, setViewDate] = useState(new Date(2026, 5, 1)); // June 2026
  const [selectedDay, setSelectedDay] = useState(10);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const cells = getMonthGrid(year, month);

  const goToPrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const isFriday = (index: number): boolean => index % 7 === 5;

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={goToPrevMonth}
          aria-label="Previous month"
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        <h2 className="text-lg font-medium text-blue-500">
          {MONTH_NAMES[month]} {year}
        </h2>

        <button
          onClick={goToNextMonth}
          aria-label="Next month"
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="mb-2 grid grid-cols-7">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-[11px] font-medium tracking-wide text-gray-400"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-y-2">
        {cells.map((cell, index) => {
          const friday = isFriday(index);
          const selected = cell.currentMonth && cell.day === selectedDay;

          return (
            <div key={index} className="flex items-center justify-center py-1">
              <button
                onClick={() => cell.currentMonth && setSelectedDay(cell.day)}
                disabled={!cell.currentMonth}
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors",
                  !cell.currentMonth && "text-gray-300 cursor-default",
                  cell.currentMonth &&
                    !selected &&
                    !friday &&
                    "text-gray-800 hover:bg-gray-100",
                  cell.currentMonth &&
                    !selected &&
                    friday &&
                    "text-red-400 hover:bg-gray-100",
                  selected && "bg-blue-500 text-white font-medium",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {cell.day}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
