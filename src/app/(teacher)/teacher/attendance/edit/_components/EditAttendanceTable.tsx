"use client";

import {
  CheckCircle2,
  ClipboardList,
  Loader2,
  Pencil,
  RotateCcw,
  Save,
  UserCheck,
  Users,
  UserX,
  XCircle,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";
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
import { updateManyStudentAttendances } from "@/services/studentAttendance";
import type { TStudentAttendanceDetail } from "@/types/modules/teacher/attendance.type";

type AttendanceStatus = "PRESENT" | "ABSENT";

interface EditAttendanceTableProps {
  records: TStudentAttendanceDetail[];
  attendanceDate: string;
  classNameLabel: string;
  subjectName?: string;
  groupName?: string;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

// Prefer the enrollment of the class this attendance was taken in (a
// promoted student owns closed history rows too) — fall back to [0].
const getRegNo = (record: TStudentAttendanceDetail) => {
  const enrollments = record.student?.studentEnrollments ?? [];
  const match = enrollments.find(
    (e) => e.academic_class_id === record.academic_class_id,
  );
  return (
    match?.registration_number ?? enrollments[0]?.registration_number ?? "—"
  );
};

const EditAttendanceTable = ({
  records,
  attendanceDate,
  classNameLabel,
  subjectName,
  groupName,
}: EditAttendanceTableProps) => {
  const initialMap = useMemo(
    () =>
      Object.fromEntries(
        records.map((r) => [r.id, r.attendance_status as AttendanceStatus]),
      ) as Record<string, AttendanceStatus>,
    [records],
  );

  const [statusMap, setStatusMap] =
    useState<Record<string, AttendanceStatus>>(initialMap);
  const [baseline, setBaseline] =
    useState<Record<string, AttendanceStatus>>(initialMap);
  const [isPending, startTransition] = useTransition();

  const handleMark = (recordId: string, status: AttendanceStatus) => {
    setStatusMap((prev) =>
      prev[recordId] === status ? prev : { ...prev, [recordId]: status },
    );
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    setStatusMap(
      Object.fromEntries(records.map((r) => [r.id, status])) as Record<
        string,
        AttendanceStatus
      >,
    );
  };

  const handleReset = () => setStatusMap(baseline);

  const changedEntries = useMemo(
    () =>
      Object.entries(statusMap).filter(
        ([id, status]) => baseline[id] !== status,
      ),
    [statusMap, baseline],
  );

  const presentCount = Object.values(statusMap).filter(
    (s) => s === "PRESENT",
  ).length;
  const absentCount = Object.values(statusMap).filter(
    (s) => s === "ABSENT",
  ).length;

  const handleSubmit = () => {
    if (changedEntries.length === 0) {
      toast.info("No changes to save.");
      return;
    }

    const updates = changedEntries.map(([id, attendance_status]) => ({
      id,
      attendance_status,
    }));

    startTransition(async () => {
      try {
        const response = await updateManyStudentAttendances({ updates });
        if (!response?.success) {
          toast.error(response?.message ?? "Failed to update attendance");
          return;
        }
        toast.success(
          response?.message ??
            `${updates.length} attendance record(s) updated successfully`,
        );
        setBaseline({ ...statusMap });
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to update attendance",
        );
      }
    });
  };

  if (records.length === 0) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <ClipboardList className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">
            No attendance records found for this session.
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Only sessions taken by you can be edited.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-amber-300/60 bg-amber-50/60 shadow-sm">
        <CardContent className="flex items-start gap-3 p-4">
          <Pencil className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Editing your session — {attendanceDate}
              {classNameLabel ? ` · ${classNameLabel}` : ""}
              {subjectName && subjectName !== "N/A" ? ` · ${subjectName}` : ""}
              {groupName ? ` · ${groupName}` : ""}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-amber-700/80">
              Fix mistakes by toggling Present/Absent for multiple students at
              once, then save all changes together — just like taking
              attendance.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold tracking-tight">
              <Pencil className="mr-2 inline-block h-5 w-5 text-amber-600" />
              Edit Attendance
            </CardTitle>
            <CardDescription className="text-xs">
              {records.length} student{records.length !== 1 ? "s" : ""} ·{" "}
              {changedEntries.length} change
              {changedEntries.length !== 1 ? "s" : ""}
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => handleMarkAll("PRESENT")}
              >
                All Present
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => handleMarkAll("ABSENT")}
              >
                All Absent
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="h-10 w-12 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    SN
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Users className="mr-1.5 inline-block h-3.5 w-3.5" />
                    Student Name
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Reg No
                  </TableHead>
                  <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="h-10 w-52 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record, index) => {
                  const status =
                    statusMap[record.id] ?? record.attendance_status;
                  const isPresent = status === "PRESENT";
                  const isAbsent = status === "ABSENT";
                  const isChanged = baseline[record.id] !== status;
                  const name = record.student?.name ?? "Unknown Student";
                  const regNo = getRegNo(record);

                  return (
                    <TableRow
                      key={record.id}
                      className={`transition-colors hover:bg-muted/20 ${
                        isPresent
                          ? "bg-emerald-50/40 hover:bg-emerald-50/60"
                          : "bg-red-50/40 hover:bg-red-50/60"
                      }`}
                    >
                      <TableCell className="text-center text-xs text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-border/50">
                            <AvatarImage
                              src={record.student?.photo ?? undefined}
                              alt={name}
                            />
                            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                              {getInitials(name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{name}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {record.student?.father_name
                                ? `Father: ${record.student.father_name}`
                                : "Father: —"}
                            </span>
                          </div>
                          {isChanged && (
                            <Badge
                              variant="outline"
                              className="border-amber-200 text-[10px] text-amber-700"
                            >
                              Changed
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {regNo}
                      </TableCell>
                      <TableCell className="text-center">
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
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant={isPresent ? "default" : "outline"}
                            className={`h-8 min-w-[88px] gap-1.5 text-xs font-medium transition-all ${
                              isPresent
                                ? "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600"
                                : "border-emerald-200 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50"
                            }`}
                            onClick={() => handleMark(record.id, "PRESENT")}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Present
                          </Button>
                          <Button
                            size="sm"
                            variant={isAbsent ? "default" : "outline"}
                            className={`h-8 min-w-22 gap-1.5 text-xs font-medium transition-all ${
                              isAbsent
                                ? "bg-red-500 text-white shadow-sm hover:bg-red-600"
                                : "border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50"
                            }`}
                            onClick={() => handleMark(record.id, "ABSENT")}
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
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-border/50 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            {changedEntries.length} of {records.length} changed · {presentCount}{" "}
            present, {absentCount} absent
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              disabled={changedEntries.length === 0 || isPending}
              onClick={handleReset}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
            <Button
              size="sm"
              disabled={changedEntries.length === 0 || isPending}
              className="h-8 gap-1.5 bg-amber-600 text-xs text-white hover:bg-amber-700"
              onClick={handleSubmit}
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {isPending
                ? "Saving..."
                : `Save ${changedEntries.length > 0 ? `(${changedEntries.length})` : ""}`}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EditAttendanceTable;
