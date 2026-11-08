"use client";

import { BookOpen, DoorOpen, Loader2 } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getClassRoutineByStudentId } from "@/services/classRoutine";

type ClassRoutineItem = {
  day: string;
  period_no: number;
  subject_id: string;
  teacher_id: string;
  /**
   * Room / lab of this slot. Only ever the student's own class, because the
   * endpoint returns nothing but the routines that apply to them. Null for
   * routines saved before rooms existed.
   */
  roomNo?: string | null;
  subject?: { name?: string; code?: string };
  teacher?: { full_name?: string; name?: string };
};

type ClassRoutineRecord = {
  id: string;
  academic_class_id?: string | null;
  academic_section_id?: string | null;
  batch_id?: string | null;
  shift_id?: string | null;
  classRoutineItems?: ClassRoutineItem[];
  academicClass?: { class_name?: string; name?: string } | null;
  academicSection?: { section_name?: string; name?: string } | null;
  batch?: { batch_name?: string; name?: string } | null;
  shift?: { shift_name?: string; name?: string } | null;
  created_at?: string;
};

type Enrollment = {
  academic_class_id: string;
  class_name?: string;
  is_primary?: boolean;
};

type StudentClassRoutineClientProps = {
  routines: ClassRoutineRecord[];
  currentClass?: string | null;
  enrollments: Enrollment[];
};

// Bangladesh week starts on Saturday
const DAY_ORDER = [
  "saturday",
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

function normalizeDay(day: string): string {
  return (day ?? "").toLowerCase().trim();
}

function getSubjectName(item: ClassRoutineItem): string {
  return item.subject?.name ?? item.subject?.code ?? item.subject_id ?? "—";
}

/** The room of a cell, or "" when the admin did not set one. */
function getRoomNo(item: ClassRoutineItem | undefined): string {
  return (item?.roomNo ?? "").trim();
}

function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function ordinal(n: number): string {
  const suffixes: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" };
  const mod100 = n % 100;
  const suffix =
    mod100 >= 11 && mod100 <= 13 ? "th" : (suffixes[n % 10] ?? "th");
  return `${n}${suffix}`;
}

function getEnrollmentLabel(enrollment: Enrollment): string {
  const name = enrollment.class_name ?? "Unknown";
  return enrollment.is_primary ? `${name} (Current)` : name;
}

export default function StudentClassRoutineClient({
  routines: initialRoutines,
  currentClass,
  enrollments,
}: StudentClassRoutineClientProps) {
  const primaryEnrollment = enrollments.find((e) => e.is_primary);
  const [selectedClassId, setSelectedClassId] = useState(
    primaryEnrollment?.academic_class_id ?? "",
  );
  const [routines, setRoutines] =
    useState<ClassRoutineRecord[]>(initialRoutines);
  const [isPending, startTransition] = useTransition();
  const isInitialMount = useRef(true);

  // Debug: log enrollments to help diagnose label/value issues
  // TODO: Remove after verification
  useEffect(() => {
    console.log("[StudentClassRoutine] enrollments:", enrollments);
    console.log(
      "[StudentClassRoutine] dropdown options:",
      enrollments.map((e) => ({
        value: e.academic_class_id,
        label: getEnrollmentLabel(e),
        is_primary: e.is_primary,
      })),
    );
  }, [enrollments]);

  // Sort enrollments: primary first, then by class_name descending (newest year first)
  const sortedEnrollments = [...enrollments].sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return (b.class_name ?? "").localeCompare(a.class_name ?? "");
  });

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!selectedClassId) return;

    // Debug: log which class ID is being fetched
    // TODO: Remove after verification
    console.log(
      "[StudentClassRoutine] fetching routine for academic_class_id:",
      selectedClassId,
    );

    startTransition(async () => {
      const response = await getClassRoutineByStudentId(selectedClassId);
      const data = response?.data ?? [];
      console.log("[StudentClassRoutine] fetch response:", {
        classId: selectedClassId,
        routineCount: Array.isArray(data) ? data.length : 0,
      });
      setRoutines(Array.isArray(data) ? data : [data]);
    });
  }, [selectedClassId]);

  if (enrollments.length === 0 && (!routines || routines.length === 0)) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardContent className="py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted/30">
            <BookOpen className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <h3 className="text-base font-semibold">No Enrollments Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            You are not enrolled in any class yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!routines || routines.length === 0) {
    return (
      <div className="space-y-4">
        {sortedEnrollments.length > 1 && (
          <Select
            value={selectedClassId}
            onValueChange={(v) => v && setSelectedClassId(v)}
          >
            <SelectTrigger className="w-55">
              <SelectValue placeholder="Select year">
                {(() => {
                  const selected = sortedEnrollments.find(
                    (e) => e.academic_class_id === selectedClassId,
                  );
                  return selected
                    ? getEnrollmentLabel(selected)
                    : "Select year";
                })()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {sortedEnrollments.map((enrollment) => (
                <SelectItem
                  key={enrollment.academic_class_id}
                  value={enrollment.academic_class_id}
                >
                  {getEnrollmentLabel(enrollment)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted/30">
              <BookOpen className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <h3 className="text-base font-semibold">No Class Routine Found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              No routine published yet for {currentClass ?? "your class"}.
              Please check back later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Merge every routine's items into a single flat list so the whole
  // week renders as one table, regardless of how many routine records
  // exist behind the scenes.
  const allItems: ClassRoutineItem[] = [];
  for (const routine of routines) {
    allItems.push(...(routine.classRoutineItems ?? []));
  }

  if (allItems.length === 0) {
    return (
      <div className="space-y-4">
        {sortedEnrollments.length > 1 && (
          <Select
            value={selectedClassId}
            onValueChange={(v) => v && setSelectedClassId(v)}
          >
            <SelectTrigger className="w-55">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {sortedEnrollments.map((enrollment) => (
                <SelectItem
                  key={enrollment.academic_class_id}
                  value={enrollment.academic_class_id}
                >
                  {getEnrollmentLabel(enrollment)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No routine items found for this class.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // All days that actually have at least one item, de-duplicated so each
  // day is a single row — ordered Sat → Fri (Bangladesh week).
  const allDays = Array.from(
    new Set(allItems.map((item) => normalizeDay(item.day))),
  )
    .filter((d) => d)
    .sort((a, b) => {
      const ai = DAY_ORDER.indexOf(a);
      const bi = DAY_ORDER.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

  // Every distinct period number across all routines, ascending.
  const periods = Array.from(
    new Set(allItems.map((item) => item.period_no).filter((p) => p != null)),
  ).sort((a, b) => a - b);

  return (
    <div className="space-y-4">
      {sortedEnrollments.length > 1 && (
        <Select
          value={selectedClassId}
          onValueChange={(v) => v && setSelectedClassId(v)}
        >
          <SelectTrigger className="w-55">
            <SelectValue placeholder="Select year">
              {(() => {
                const selected = sortedEnrollments.find(
                  (e) => e.academic_class_id === selectedClassId,
                );
                return selected ? getEnrollmentLabel(selected) : "Select year";
              })()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {sortedEnrollments.map((enrollment) => (
              <SelectItem
                key={enrollment.academic_class_id}
                value={enrollment.academic_class_id}
              >
                {getEnrollmentLabel(enrollment)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <div className="relative overflow-hidden rounded-xl border border-blue-600">
        {isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        )}
        <div className="max-h-[70vh] overflow-auto">
          <table className="w-max min-w-full border-collapse text-sm">
            <thead className="sticky top-0 z-20">
              <tr>
                <th className="sticky left-0 z-30 w-36 min-w-36 border border-blue-500/40 bg-blue-600 px-4 py-4 text-center text-base font-semibold text-white">
                  Day
                </th>
                {periods.map((period) => (
                  <th
                    key={period}
                    className="min-w-44 border border-blue-500/40 bg-blue-600 px-4 py-4 text-center text-base font-semibold text-white"
                  >
                    {ordinal(period)} Period
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allDays.map((day) => (
                <tr key={day} className="bg-white">
                  <td className="sticky left-0 z-10 w-36 min-w-36 border border-blue-500/30 bg-white px-4 py-6 text-center text-base font-medium text-foreground">
                    {capitalize(day)}
                  </td>
                  {periods.map((period) => {
                    const item = allItems.find(
                      (i) =>
                        normalizeDay(i.day) === day && i.period_no === period,
                    );
                    const roomNo = getRoomNo(item);
                    return (
                      <td
                        key={`${day}-${period}`}
                        className="min-w-44 border border-blue-500/30 px-4 py-6 text-center text-base text-foreground"
                      >
                        {item ? (
                          <div className="flex flex-col items-center gap-1">
                            <span>{getSubjectName(item)}</span>
                            {/* Same room line as the teacher portal; hidden
                                entirely when no room is set. */}
                            {roomNo ? (
                              <span className="inline-flex max-w-full items-center gap-1 text-xs font-medium text-muted-foreground">
                                <DoorOpen
                                  aria-hidden="true"
                                  className="h-3 w-3 shrink-0"
                                />
                                <span className="truncate">Room {roomNo}</span>
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          ""
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
