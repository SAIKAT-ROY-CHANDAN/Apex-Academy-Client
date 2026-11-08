"use client";

import {
  BookOpenCheck,
  CalendarDays,
  Eye,
  TrendingUp,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { TTeacherTakenAttendance } from "@/types/modules/teacher/attendance.type";
import AdminAttendanceDetailsDialog from "./AdminAttendanceDetailsDialog";

interface AdminAttendanceTableProps {
  data: TTeacherTakenAttendance[];
  totalRecords: number;
}

const formatDate = (date: string) => {
  if (!date) return "N/A";
  const [y, m, d] = date.split("-");
  if (!y || !m || !d) return date;
  return `${d}-${m}-${y}`;
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const getRateColor = (rate: number) => {
  if (rate >= 80) return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
  if (rate >= 50) return "bg-amber-100 text-amber-700 hover:bg-amber-100";
  return "bg-red-100 text-red-700 hover:bg-red-100";
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

const AdminAttendanceTable = ({
  data,
  totalRecords,
}: AdminAttendanceTableProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<TTeacherTakenAttendance | null>(
    null,
  );

  const totalPresent = data.reduce((sum, r) => sum + r.present, 0);
  const totalAbsent = data.reduce((sum, r) => sum + r.absent, 0);
  const totalMarked = totalPresent + totalAbsent;
  const overallRate =
    totalMarked === 0 ? 0 : Math.round((totalPresent / totalMarked) * 100);

  const handleView = (row: TTeacherTakenAttendance) => {
    setSelected(row);
    setDialogOpen(true);
  };

  return (
    <>
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
            Attendance Records
          </CardTitle>
          <Badge variant="secondary" className="text-xs font-medium">
            {data.length} session{data.length !== 1 ? "s" : ""}
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          {data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                No attendance records found.
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                No attendance has been recorded for the selected filters.
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
                      Teacher
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Class/Year
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Subject
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Group
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
                    <TableHead className="h-10 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row, index) => {
                    const rate =
                      row.total === 0
                        ? 0
                        : Math.round((row.present / row.total) * 100);
                    return (
                      <TableRow
                        key={`${row.attendance_date}|${row.teacher_id ?? ""}|${row.academic_class_id ?? ""}|${row.subject_id ?? ""}|${row.group ?? ""}|${index}`}
                        className="transition-colors hover:bg-muted/20"
                      >
                        <TableCell className="text-center text-xs text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm font-medium">
                          {formatDate(row.attendance_date)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                              {getInitials(row.teacher_name)}
                            </span>
                            <span className="whitespace-nowrap text-sm font-medium">
                              {row.teacher_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {row.class_name}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {row.subject_name !== "N/A" ? row.subject_name : "—"}
                        </TableCell>
                        <TableCell>
                          {row.group ? (
                            <Badge
                              variant="secondary"
                              className="text-xs font-medium"
                            >
                              {row.group}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="gap-1 bg-emerald-100 px-2 py-0 text-xs font-medium text-emerald-700 hover:bg-emerald-100">
                            {row.present}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="gap-1 bg-red-100 px-2 py-0 text-xs font-medium text-red-700 hover:bg-red-100">
                            {row.absent}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-sm font-semibold">
                          {row.total}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={cn(
                              "gap-1 px-2 py-0 text-xs font-medium",
                              getRateColor(rate),
                            )}
                          >
                            {rate}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 text-xs"
                            onClick={() => handleView(row)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View Details
                          </Button>
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

      <AdminAttendanceDetailsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        session={selected}
        teacherId={selected?.teacher_id ?? ""}
      />
    </>
  );
};

export default AdminAttendanceTable;
