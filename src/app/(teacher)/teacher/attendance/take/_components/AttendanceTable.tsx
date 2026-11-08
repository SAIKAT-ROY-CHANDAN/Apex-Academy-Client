"use client";

import {
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  GraduationCap,
  Hash,
  Loader2,
  Lock,
  RotateCcw,
  Save,
  UserCheck,
  Users,
  UserX,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createManyStudentAttendances } from "@/services/studentAttendance";
import { createManyStudentAttendancesValidation } from "@/validation/studentAttendance/student-attendance.validation";

// ─── Types ───────────────────────────────────────────────────────────────────

type TEnrolledStudent = {
  id: string;
  student_id: string;
  academic_class_id: string;
  roll_number: string;
  registration_number: string;
  student: {
    id: string;
    name: string;
    father_name: string;
    mother_name: string;
    photo: string | null;
  };
  academicClass: {
    id: string;
    class_name: string;
  };
  academicSection?: {
    id: string;
    section_name: string;
  };
  batch?: {
    id: string;
    batch_name: string;
  };
  shift?: {
    id: string;
    name: string;
  };
};

type TAttendanceRecord = {
  student_id: string;
  attendance_status: "PRESENT" | "ABSENT";
  teacher_id: string;
  attendance_date: string;
  academic_class_id: string;
  subject_id?: string;
  group?: string;
  lastUpdatedAt: string;
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface AttendanceTableProps {
  students: TEnrolledStudent[];
  teacherId: string;
  selectedClassId: string;
  group?: string;
  subjectId?: string;
  attendanceTakenToday?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const getTodayISO = () => new Date().toISOString();

const getCurrentTimestamp = () => {
  return new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// ─── Component ───────────────────────────────────────────────────────────────

const AttendanceTable = ({
  students,
  teacherId,
  selectedClassId,
  group,
  subjectId,
  attendanceTakenToday,
}: AttendanceTableProps) => {
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, TAttendanceRecord>
  >({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const attendanceDate = getTodayDate();

  const studentIdsKey = students.map((s) => s.student_id).join(",");

  // Reset state when the enrolled student set changes
  useEffect(() => {
    if (!studentIdsKey) return;
    setAttendanceMap({});
    setIsSubmitted(false);
  }, [studentIdsKey]);

  const handleMarkAttendance = useCallback(
    (studentId: string, status: "PRESENT" | "ABSENT") => {
      if (attendanceTakenToday) return;
      const now = getCurrentTimestamp();

      setAttendanceMap((prev) => ({
        ...prev,
        [studentId]: {
          student_id: studentId,
          attendance_status: status,
          teacher_id: teacherId,
          attendance_date: getTodayISO(),
          academic_class_id: selectedClassId,
          ...(group ? { group } : {}),
          ...(subjectId ? { subject_id: subjectId } : {}),
          lastUpdatedAt: now,
        },
      }));

      setIsSubmitted(false);
    },
    [teacherId, selectedClassId, group, subjectId, attendanceTakenToday],
  );

  const handleSubmit = () => {
    const records = Object.values(attendanceMap).map(
      ({ lastUpdatedAt: _lastUpdatedAt, ...rest }) => rest,
    );

    const validation = createManyStudentAttendancesValidation.safeParse({
      attendances: records,
    });
    if (!validation.success) {
      toast.error(
        "Some attendance records are invalid. Please review and try again.",
      );
      return;
    }

    startTransition(async () => {
      try {
        const response = await createManyStudentAttendances({
          attendances: records,
        });

        if (!response?.success) {
          toast.error(
            response?.message ?? "Failed to submit attendance records",
          );
          return;
        }

        toast.success(
          response?.message ??
            `${records.length} attendance record(s) submitted successfully`,
        );
        setIsSubmitted(true);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to submit attendance records",
        );
      }
    });
  };

  const handleReset = () => {
    setAttendanceMap({});
    setIsSubmitted(false);
  };

  const getAttendanceStatus = (studentId: string) => {
    return attendanceMap[studentId]?.attendance_status ?? null;
  };

  const presentCount = Object.values(attendanceMap).filter(
    (r) => r.attendance_status === "PRESENT",
  ).length;
  const absentCount = Object.values(attendanceMap).filter(
    (r) => r.attendance_status === "ABSENT",
  ).length;
  const totalMarked = Object.keys(attendanceMap).length;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Already-submitted-today notice */}
      {attendanceTakenToday && (
        <Card className="border-amber-300/60 bg-amber-50/60 shadow-sm">
          <CardContent className="flex items-start gap-3 p-4">
            <Lock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                Attendance already submitted for today
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-amber-700/80">
                Attendance for this{" "}
                {subjectId ? "subject" : group ? "group" : "class"}
                {students[0]?.academicClass?.class_name
                  ? ` (${students[0].academicClass.class_name})`
                  : ""}{" "}
                has already been taken for the current day. You cannot mark or
                submit attendance again.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Summary Card */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold tracking-tight">
              <Users className="mr-2 inline-block h-5 w-5 text-primary" />
              Take Attendance
            </CardTitle>
            <CardDescription className="text-xs">
              <Clock className="mr-1 inline-block h-3.5 w-3.5" />
              {attendanceDate} &middot;{" "}
              {students.length > 0
                ? `${students[0].academicClass?.class_name ?? "—"}`
                : "—"}{" "}
              {students[0]?.academicSection?.section_name
                ? `| ${students[0].academicSection.section_name}`
                : ""}
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <UserCheck className="h-4 w-4 text-emerald-500" />
              <span className="font-medium text-emerald-600">
                {presentCount}
              </span>
              <span className="hidden sm:inline">Present</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <UserX className="h-4 w-4 text-red-500" />
              <span className="font-medium text-red-600">{absentCount}</span>
              <span className="hidden sm:inline">Absent</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <span className="text-xs text-muted-foreground">
              <span className="font-medium">{totalMarked}</span> /{" "}
              {students.length} marked
            </span>
          </div>
        </CardHeader>
      </Card>

      {/* Main Table Card */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-0">
          {students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ClipboardList className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                No students found.
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Select a class with enrolled students to take attendance.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="h-10 w-12 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Hash className="mx-auto h-3.5 w-3.5" />
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <GraduationCap className="mr-1.5 inline-block h-3.5 w-3.5" />
                      Roll
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Users className="mr-1.5 inline-block h-3.5 w-3.5" />
                      Student Name
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <FileText className="mr-1.5 inline-block h-3.5 w-3.5" />
                      Father's Name
                    </TableHead>
                    <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="h-10 w-48 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((enrollment, index) => {
                    const status = getAttendanceStatus(enrollment.student_id);
                    const isPresent = status === "PRESENT";
                    const isAbsent = status === "ABSENT";

                    return (
                      <TableRow
                        key={enrollment.student_id}
                        className={`group transition-colors hover:bg-muted/20 ${
                          isPresent
                            ? "bg-emerald-50/40 hover:bg-emerald-50/60"
                            : isAbsent
                              ? "bg-red-50/40 hover:bg-red-50/60"
                              : ""
                        }`}
                      >
                        <TableCell className="text-center text-xs text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-medium">
                          {enrollment.roll_number}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-border/50">
                              <AvatarImage
                                src={enrollment.student?.photo ?? undefined}
                                alt={enrollment.student?.name}
                              />
                              <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                                {getInitials(enrollment.student?.name ?? "U")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {enrollment.student?.name ?? "—"}
                              </span>
                              {enrollment.batch?.batch_name && (
                                <span className="text-[10px] text-muted-foreground">
                                  Batch: {enrollment.batch.batch_name}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {enrollment.student?.father_name ?? "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          {status ? (
                            <Badge
                              variant={isPresent ? "default" : "destructive"}
                              className={`gap-1 px-2.5 py-0.5 text-[11px] font-medium ${
                                isPresent
                                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                  : "bg-red-100 text-red-700 hover:bg-red-100"
                              }`}
                            >
                              {isPresent ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : (
                                <XCircle className="h-3 w-3" />
                              )}
                              {status}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground/60">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant={isPresent ? "default" : "outline"}
                              disabled={attendanceTakenToday}
                              className={`h-8 min-w-[88px] gap-1.5 text-xs font-medium transition-all ${
                                isPresent
                                  ? "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600"
                                  : "border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"
                              }`}
                              onClick={() =>
                                handleMarkAttendance(
                                  enrollment.student_id,
                                  "PRESENT",
                                )
                              }
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Present
                            </Button>
                            <Button
                              size="sm"
                              variant={isAbsent ? "default" : "outline"}
                              disabled={attendanceTakenToday}
                              className={`h-8 min-w-22 gap-1.5 text-xs font-medium transition-all ${
                                isAbsent
                                  ? "bg-red-500 text-white shadow-sm hover:bg-red-600"
                                  : "border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                              }`}
                              onClick={() =>
                                handleMarkAttendance(
                                  enrollment.student_id,
                                  "ABSENT",
                                )
                              }
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Absent
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>

        {students.length > 0 && (
          <CardFooter className="flex items-center justify-between border-t border-border/50 px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Showing all {students.length} student
              {students.length !== 1 ? "s" : ""}
              {totalMarked > 0 &&
                ` · ${presentCount} present, ${absentCount} absent`}
            </p>
            <div className="flex items-center gap-2">
              {totalMarked > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={attendanceTakenToday}
                    className="h-8 gap-1.5 text-xs"
                    onClick={handleReset}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    disabled={isPending || attendanceTakenToday}
                    className={`h-8 gap-1.5 text-xs ${
                      isSubmitted ? "bg-emerald-500 hover:bg-emerald-600" : ""
                    }`}
                    onClick={handleSubmit}
                  >
                    {isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    {isPending
                      ? "Submitting..."
                      : isSubmitted
                        ? "Submitted"
                        : "Submit Attendance"}
                  </Button>
                </>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default AttendanceTable;
