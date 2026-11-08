// components/DateField.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { FaRegCalendarAlt } from "react-icons/fa";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";

type DateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export default function DateField({ label, value, onChange }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      onChange(format(date, "dd-MM-yyyy"));
    }
    setOpen(false);
  };

  return (
    <div className="w-full relative" ref={wrapperRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>

      <div className="flex items-center justify-between gap-2 border rounded-lg px-2.5">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="DD-MM-YYYY"
          className="w-full bg-transparent text-sm text-gray-600 placeholder:text-gray-400 outline-none border-r rounded-r-[10px] py-2.5"
        />
        <button
          type="button"
          aria-label="Open calendar"
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <FaRegCalendarAlt size={14} />
        </button>
      </div>

      {open && (
        <div className="absolute z-50 mt-2 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
          />
        </div>
      )}
    </div>
  );
}
