"use client";

import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  Loader2,
  Search,
  TrendingUp,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getStudentAttendances } from "@/services/studentAttendance";
import type {
  TStudentAttendanceDetail,
  TTeacherTakenAttendance,
} from "@/types/modules/teacher/attendance.type";

interface AdminAttendanceDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: TTeacherTakenAttendance | null;
  teacherId: string;
}

type StatusFilter = "ALL" | "PRESENT" | "ABSENT";

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

const getRollNumber = (record: TStudentAttendanceDetail) => {
  const enrollments = record.student?.studentEnrollments ?? [];
  const match = enrollments.find(
    (e) => e.academic_class_id === record.academic_class_id,
  );
  return match?.roll_number ?? enrollments[0]?.roll_number ?? null;
};

const StatItem = ({
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
  <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-background p-3">
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent}`}
    >
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-lg font-bold leading-none">{value}</p>
    </div>
  </div>
);

const AdminAttendanceDetailsDialog = ({
  open,
  onOpenChange,
  session,
  teacherId,
}: AdminAttendanceDetailsDialogProps) => {
  const [records, setRecords] = useState<TStudentAttendanceDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  useEffect(() => {
    if (open && session) {
      setSearchTerm("");
      setStatusFilter("ALL");
    }
  }, [open, session]);

  useEffect(() => {
    if (!open || !session) return;

    let cancelled = false;
    setRecords([]);
    setLoading(true);

    const filter: Record<string, unknown> = {
      teacher_id: teacherId,
      academic_class_id: session.academic_class_id,
      attendance_date: {
        gte: `${session.attendance_date}T00:00:00.000Z`,
        lte: `${session.attendance_date}T23:59:59.999Z`,
      },
    };
    if (session.subject_id) filter.subject_id = session.subject_id;
    if (session.group) filter.group = session.group;

    const load = async () => {
      const all: TStudentAttendanceDetail[] = [];
      const pageSize = 500;
      let page = 1;

      try {
        while (!cancelled) {
          const res = await getStudentAttendances([
            { label: "filter", value: JSON.stringify(filter) },
            { label: "page", value: String(page) },
            { label: "limit", value: String(pageSize) },
          ]);
          if (cancelled) return;
          const data = res?.data ?? [];
          all.push(...data);
          const meta = res?.meta as { totalPages?: number } | undefined;
          const totalPages = meta?.totalPages ?? 1;
          if (page >= totalPages || data.length < pageSize) break;
          page += 1;
        }
        setRecords(all);
      } catch {
        setRecords([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [open, session, teacherId]);

  const query = searchTerm.trim().toLowerCase();
  const filteredRecords = records.filter((record) => {
    const statusMatch =
      statusFilter === "ALL" || record.attendance_status === statusFilter;
    if (!statusMatch) return false;
    if (!query) return true;
    const name = record.student?.name?.toLowerCase() ?? "";
    const father = record.student?.father_name?.toLowerCase() ?? "";
    const roll = getRollNumber(record)?.toLowerCase() ?? "";
    return (
      name.includes(query) || father.includes(query) || roll.includes(query)
    );
  });

  const presentCount = records.filter(
    (r) => r.attendance_status === "PRESENT",
  ).length;
  const absentCount = records.length - presentCount;
  const rate =
    records.length === 0
      ? 0
      : Math.round((presentCount / records.length) * 100);

  const tabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: "ALL", label: "All", count: records.length },
    { key: "PRESENT", label: "Present", count: presentCount },
    { key: "ABSENT", label: "Absent", count: absentCount },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="flex flex-row items-start gap-4 border-b border-border/60 p-5 pr-12">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <ClipboardCheck className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="truncate text-lg font-semibold">
              Attendance Details
            </DialogTitle>
            <DialogDescription className="mt-1 truncate">
              {session?.class_name}
              {session?.subject_name && session.subject_name !== "N/A"
                ? ` • ${session.subject_name}`
                : ""}
            </DialogDescription>
          </div>
          <Badge variant="secondary" className="shrink-0 text-xs font-medium">
            {session ? formatDate(session.attendance_date) : "N/A"}
          </Badge>
        </DialogHeader>

        {session && (
          <>
            <div className="flex flex-wrap gap-2 border-b border-border/60 px-5 py-3">
              <Badge variant="outline" className="gap-1.5 text-xs font-medium">
                <GraduationCap className="h-3.5 w-3.5" />
                {session.teacher_name}
              </Badge>
              {session.group && (
                <Badge
                  variant="outline"
                  className="gap-1.5 text-xs font-medium"
                >
                  <Users className="h-3.5 w-3.5" />
                  Group: {session.group}
                </Badge>
              )}
              {session.subject_name !== "N/A" && (
                <Badge
                  variant="outline"
                  className="gap-1.5 text-xs font-medium"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  {session.subject_name}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 border-b border-border/60 p-5 sm:grid-cols-4">
              <StatItem
                icon={<UserCheck className="h-4 w-4 text-emerald-600" />}
                label="Present"
                value={presentCount}
                accent="bg-emerald-50"
              />
              <StatItem
                icon={<UserX className="h-4 w-4 text-red-600" />}
                label="Absent"
                value={absentCount}
                accent="bg-red-50"
              />
              <StatItem
                icon={<Users className="h-4 w-4 text-blue-600" />}
                label="Total"
                value={records.length}
                accent="bg-blue-50"
              />
              <StatItem
                icon={<TrendingUp className="h-4 w-4 text-violet-600" />}
                label="Rate"
                value={loading ? "—" : `${rate}%`}
                accent="bg-violet-50"
              />
            </div>

            <div className="flex flex-col gap-3 border-b border-border/60 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, father or roll…"
                  className="h-9 pl-8 text-sm"
                />
              </div>
              <div className="flex items-center gap-1.5">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setStatusFilter(tab.key)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                      statusFilter === tab.key
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                    )}
                  >
                    {tab.label}
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                        statusFilter === tab.key
                          ? "bg-white/20 text-white"
                          : "bg-white text-slate-600",
                      )}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl border border-border/40 p-3"
                    >
                      <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
                        <div className="h-2.5 w-1/4 animate-pulse rounded bg-slate-200" />
                      </div>
                      <div className="h-5 w-16 animate-pulse rounded-full bg-slate-200" />
                    </div>
                  ))}
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <Search className="mb-3 h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground">
                    {searchTerm
                      ? "No students match your search."
                      : "No attendance records found."}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/60">
                    {searchTerm
                      ? "Try a different name, father's name or roll number."
                      : statusFilter === "ALL"
                        ? "No students were recorded for this session."
                        : `No ${statusFilter.toLowerCase()} students in this session.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredRecords.map((record) => {
                    const name = record.student?.name ?? "Unknown Student";
                    const father = record.student?.father_name ?? "N/A";
                    const roll = getRollNumber(record);
                    const isPresent = record.attendance_status === "PRESENT";
                    return (
                      <div
                        key={record.id}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border border-l-4 bg-background p-3 shadow-sm",
                          isPresent
                            ? "border-l-emerald-500"
                            : "border-l-red-500",
                        )}
                      >
                        <Avatar size="sm">
                          {record.student?.photo ? (
                            <AvatarImage
                              src={record.student.photo}
                              alt={name}
                            />
                          ) : null}
                          <AvatarFallback>{getInitials(name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {father}
                          </p>
                        </div>
                        {roll && (
                          <Badge
                            variant="outline"
                            className="hidden shrink-0 font-mono text-xs text-muted-foreground sm:inline-flex"
                          >
                            #{roll}
                          </Badge>
                        )}
                        <Badge
                          className={cn(
                            "shrink-0 px-2 py-0 text-xs font-medium",
                            isPresent
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                              : "bg-red-100 text-red-700 hover:bg-red-100",
                          )}
                        >
                          {isPresent ? "Present" : "Absent"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        <DialogFooter className="items-center gap-3 border-t border-border/60 px-5 py-4">
          <div className="flex flex-1 items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            Showing {filteredRecords.length} of {records.length} students
            {loading && <Loader2 className="ml-1 h-3.5 w-3.5 animate-spin" />}
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminAttendanceDetailsDialog;
