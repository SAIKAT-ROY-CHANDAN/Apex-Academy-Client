"use client";

import {
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Eye,
  GraduationCap,
  Loader2,
  Pencil,
  TrendingUp,
  UserCheck,
  UserX,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TTeacherTakenAttendance } from "@/types/modules/teacher/attendance.type";

interface AttendanceHistoryTableProps {
  data: TTeacherTakenAttendance[];
  totalRecords: number;
  loading?: boolean;
}

const formatDate = (date: string) => {
  if (!date) return "N/A";
  const [y, m, d] = date.split("-");
  if (!y || !m || !d) return date;
  return `${d}-${m}-${y}`;
};

const getAttendanceRate = (present: number, total: number) =>
  total === 0 ? 0 : Math.round((present / total) * 100);

const buildViewHref = (row: TTeacherTakenAttendance) => {
  const params = new URLSearchParams({
    attendance_date: row.attendance_date,
    academic_class_id: row.academic_class_id ?? "",
    class_name: row.class_name ?? "",
    subject_name: row.subject_name ?? "",
  });
  if (row.subject_id) params.set("subject_id", row.subject_id);
  if (row.group) params.set("group", row.group);
  return `/teacher/attendance/view?${params.toString()}`;
};

const buildEditHref = (row: TTeacherTakenAttendance) => {
  const params = new URLSearchParams({
    attendance_date: row.attendance_date,
    academic_class_id: row.academic_class_id ?? "",
    class_name: row.class_name ?? "",
    subject_name: row.subject_name ?? "",
  });
  if (row.subject_id) params.set("subject_id", row.subject_id);
  if (row.group) params.set("group", row.group);
  return `/teacher/attendance/edit?${params.toString()}`;
};

const StatCard = ({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent: string;
}) => (
  <Card className="border-border/50 shadow-sm">
    <CardContent className="flex items-center gap-4 p-5">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accent}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold leading-none">{value}</p>
      </div>
    </CardContent>
  </Card>
);

const AttendanceHistoryTable = ({
  data,
  totalRecords,
  loading = false,
}: AttendanceHistoryTableProps) => {
  const totalPresent = data.reduce((sum, r) => sum + r.present, 0);
  const totalAbsent = data.reduce((sum, r) => sum + r.absent, 0);
  const totalStudents = totalPresent + totalAbsent;
  const overallRate =
    totalStudents === 0 ? 0 : Math.round((totalPresent / totalStudents) * 100);

  return (
    <>
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<BookOpenCheck className="h-6 w-6 text-blue-600" />}
          label="Classes/Years Taken"
          value={totalRecords}
          accent="bg-blue-50"
        />
        <StatCard
          icon={<UserCheck className="h-6 w-6 text-emerald-600" />}
          label="Total Present"
          value={totalPresent}
          accent="bg-emerald-50"
        />
        <StatCard
          icon={<UserX className="h-6 w-6 text-red-600" />}
          label="Total Absent"
          value={totalAbsent}
          accent="bg-red-50"
        />
        <StatCard
          icon={<TrendingUp className="h-6 w-6 text-violet-600" />}
          label="Attendance Rate"
          value={`${overallRate}%`}
          accent="bg-violet-50"
        />
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
            Attendance History
          </CardTitle>
          <Badge variant="secondary" className="text-xs font-medium">
            {data.length} session{data.length !== 1 ? "s" : ""}
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-sm">Loading attendance history…</span>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <GraduationCap className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">
                No attendance records found.
              </p>
              <p className="text-xs text-muted-foreground/70">
                Taken attendance sessions will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="h-10 w-12 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      SN
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Date
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Class/Year
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Course Code
                    </TableHead>

                    <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Present
                    </TableHead>
                    <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Absent
                    </TableHead>
                    <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Total
                    </TableHead>
                    <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Rate
                    </TableHead>
                    <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row, index) => {
                    const rate = getAttendanceRate(row.present, row.total);
                    return (
                      <TableRow
                        key={`${row.attendance_date}|${row.academic_class_id ?? ""}|${row.subject_id ?? ""}|${row.group ?? ""}|${index}`}
                        className="transition-colors hover:bg-muted/20"
                      >
                        <TableCell className="text-center text-xs text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm font-medium">
                          {formatDate(row.attendance_date)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {row.class_name}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {row.subject_name !== "N/A" ? row.subject_name : "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="gap-1 bg-emerald-100 px-2 py-0 text-xs font-medium text-emerald-700 hover:bg-emerald-100">
                            <CheckCircle2 className="h-3 w-3" />
                            {row.present}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="gap-1 bg-red-100 px-2 py-0 text-xs font-medium text-red-700 hover:bg-red-100">
                            <XCircle className="h-3 w-3" />
                            {row.absent}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-sm font-semibold">
                          {row.total}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={`px-2 py-0 text-xs font-medium ${
                              rate >= 75
                                ? "border-emerald-200 text-emerald-700"
                                : "border-amber-200 text-amber-700"
                            }`}
                          >
                            {rate}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex items-center gap-2">
                            <Link
                              href={buildViewHref(row)}
                              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-xs font-medium shadow-xs transition-colors hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </Link>
                            <Link
                              href={buildEditHref(row)}
                              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 text-xs font-medium text-amber-700 shadow-xs transition-colors hover:bg-amber-100"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </Link>
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
      </Card>
    </>
  );
};

export default AttendanceHistoryTable;
