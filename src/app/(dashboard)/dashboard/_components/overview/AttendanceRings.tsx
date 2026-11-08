"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AttendanceData } from "@/types/dashboard/overview.type";

interface AttendanceRingsProps {
  attendance: AttendanceData;
}

const ringConfigs = [
  { key: "students" as const, label: "Student Attendance", color: "#3B82F6" },
  { key: "teachers" as const, label: "Teacher Attendance", color: "#22C55E" },
  { key: "staff" as const, label: "Staff Attendance", color: "#A855F7" },
];

function ProgressRing({
  percentage,
  color,
  label,
  present,
  absent,
}: {
  percentage: number;
  color: string;
  label: string;
  present: number;
  absent: number;
}) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-28 w-28">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold text-slate-800">
            {percentage > 0 ? `${percentage}%` : "No records"}
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="mt-1 text-xs text-slate-500">
          <span className="font-medium text-emerald-600">{present} Present</span>
          {" / "}
          <span className="font-medium text-red-600">{absent} Absent</span>
        </p>
      </div>
    </div>
  );
}

export function AttendanceRings({ attendance }: AttendanceRingsProps) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-slate-700">Attendance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {ringConfigs.map(({ key, label, color }) => (
            <ProgressRing
              key={key}
              percentage={attendance[key].percentage}
              color={color}
              label={label}
              present={attendance[key].present}
              absent={attendance[key].absent}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}