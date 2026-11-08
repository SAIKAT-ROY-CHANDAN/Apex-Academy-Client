"use client";

import {
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Search,
  TrendingUp,
  UserCheck,
  UserX,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { TStudentAttendanceDetail } from "@/types/modules/teacher/attendance.type";

interface StudentAttendanceReportProps {
  records: TStudentAttendanceDetail[];
  studentName?: string;
  currentFromDate: string;
  currentToDate: string;
}

type StatusFilter = "ALL" | "PRESENT" | "ABSENT";

const PAGE_SIZE = 10;

const GLASS =
  "border border-white/60 bg-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.05)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/50";

const formatDate = (date: string) => {
  if (!date) return "N/A";
  const [y, m, d] = date.split("T")[0].split("-");
  if (!y || !m || !d) return date;
  return `${d}-${m}-${y}`;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getWeekday = (date: string) => {
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? "" : WEEKDAYS[d.getDay()];
};

const getRateTone = (rate: number) =>
  rate >= 80
    ? {
        label: "Excellent",
        chip: "bg-emerald-500/15 text-emerald-600 ring-emerald-500/30",
        fill: "from-emerald-500 to-teal-400",
        dot: "bg-emerald-500",
        stops: ["#10b981", "#2dd4bf"] as const,
      }
    : rate >= 50
      ? {
          label: "Average",
          chip: "bg-amber-500/15 text-amber-600 ring-amber-500/30",
          fill: "from-amber-500 to-orange-400",
          dot: "bg-amber-500",
          stops: ["#f59e0b", "#fb923c"] as const,
        }
      : {
          label: "At Risk",
          chip: "bg-red-500/15 text-red-600 ring-red-500/30",
          fill: "from-red-500 to-rose-400",
          dot: "bg-red-500",
          stops: ["#ef4444", "#fb7185"] as const,
        };

/* ---------- Circular attendance-rate ring ---------- */

const RateRing = ({ rate }: { rate: number }) => {
  const RADIUS = 52;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const offset = CIRCUMFERENCE * (1 - rate / 100);
  const tone = getRateTone(rate);

  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg
        viewBox="0 0 120 120"
        aria-hidden="true"
        className="h-full w-full -rotate-90"
      >
        <defs>
          <linearGradient
            id="attendance-rate-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={tone.stops[0]} />
            <stop offset="100%" stopColor={tone.stops[1]} />
          </linearGradient>
        </defs>
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          strokeWidth="10"
          className="stroke-slate-200/70 dark:stroke-slate-700/50"
        />
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          stroke="url(#attendance-rate-gradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
          style={{
            filter: "drop-shadow(0 0 6px rgba(99,102,241,0.35))",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="bg-linear-to-r from-slate-900 to-slate-600 bg-clip-text text-3xl font-extrabold tabular-nums text-transparent dark:from-white dark:to-slate-300">
          {rate}%
        </span>
        <span className="mt-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          {tone.label}
        </span>
      </div>
    </div>
  );
};

/* ---------- Stat card ---------- */

const StatCard = ({
  icon,
  label,
  value,
  gradient,
  glow,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  gradient: string;
  glow: string;
}) => (
  <div
    className={cn(
      "group relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgb(0,0,0,0.08)]",
      GLASS,
    )}
  >
    <div
      className={cn(
        "pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full opacity-50 blur-2xl transition-opacity duration-300 group-hover:opacity-90",
        glow,
      )}
    />
    <div className="relative flex items-center gap-4 p-5">
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br text-white shadow-lg",
          gradient,
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 text-2xl leading-none font-bold tabular-nums">
          {value}
        </p>
      </div>
    </div>
  </div>
);

/* ---------- Main ---------- */

const StudentAttendanceReport = ({
  records,
  studentName,
  currentFromDate,
  currentToDate,
}: StudentAttendanceReportProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [fromDate, setFromDate] = useState(currentFromDate);
  const [toDate, setToDate] = useState(currentToDate);
  const [currentPage, setCurrentPage] = useState(1);

  const changeSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };
  const changeStatus = (value: StatusFilter) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };
  const changeFromDate = (value: string) => {
    setFromDate(value);
    setCurrentPage(1);
  };
  const changeToDate = (value: string) => {
    setToDate(value);
    setCurrentPage(1);
  };

  const dateFiltered = useMemo(() => {
    return records.filter((r) => {
      const d = r.attendance_date.slice(0, 10);
      if (fromDate && d < fromDate) return false;
      if (toDate && d > toDate) return false;
      return true;
    });
  }, [records, fromDate, toDate]);

  const presentCount = useMemo(
    () => dateFiltered.filter((r) => r.attendance_status === "PRESENT").length,
    [dateFiltered],
  );
  const absentCount = dateFiltered.length - presentCount;
  const rate =
    dateFiltered.length === 0
      ? 0
      : Math.round((presentCount / dateFiltered.length) * 100);

  const sessionCount = useMemo(() => {
    const keys = new Set(
      dateFiltered.map(
        (r) =>
          `${r.attendance_date.slice(0, 10)}|${r.academic_class_id ?? ""}|${r.subject_id ?? ""}|${r.group ?? ""}`,
      ),
    );
    return keys.size;
  }, [dateFiltered]);

  const subjectBreakdown = useMemo(() => {
    const map = new Map<string, { present: number; absent: number }>();
    for (const r of dateFiltered) {
      const name = r.subject?.name || "General";
      const entry = map.get(name) ?? { present: 0, absent: 0 };
      if (r.attendance_status === "PRESENT") entry.present += 1;
      else entry.absent += 1;
      map.set(name, entry);
    }
    return Array.from(map.entries()).map(([name, v]) => ({
      name,
      present: v.present,
      absent: v.absent,
      total: v.present + v.absent,
      rate:
        v.present + v.absent === 0
          ? 0
          : Math.round((v.present / (v.present + v.absent)) * 100),
    }));
  }, [dateFiltered]);

  const query = searchTerm.trim().toLowerCase();
  const filtered = useMemo(() => {
    return dateFiltered
      .filter((r) => {
        if (statusFilter !== "ALL" && r.attendance_status !== statusFilter) {
          return false;
        }
        if (!query) return true;
        const subject = r.subject?.name?.toLowerCase() ?? "";
        const cls = r.academicClass?.class_name?.toLowerCase() ?? "";
        const teacher = r.teacher?.full_name?.toLowerCase() ?? "";
        return (
          subject.includes(query) ||
          cls.includes(query) ||
          teacher.includes(query)
        );
      })
      .sort((a, b) => {
        if (a.attendance_date < b.attendance_date) return 1;
        if (a.attendance_date > b.attendance_date) return -1;
        return 0;
      });
  }, [dateFiltered, statusFilter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedRecords = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const tabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: "ALL", label: "All", count: dateFiltered.length },
    { key: "PRESENT", label: "Present", count: presentCount },
    { key: "ABSENT", label: "Absent", count: absentCount },
  ];

  const startIndex = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(safePage * PAGE_SIZE, filtered.length);

  return (
    <div className="relative">
      {/* Decorative ambient blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-400/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-40 right-0 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl"
      />

      <div className="relative space-y-6">
        {/* Hero glass banner */}
        <section className={cn("relative overflow-hidden rounded-3xl", GLASS)}>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full bg-linear-to-br from-blue-500/15 to-indigo-500/10 blur-2xl"
          />
          <div className="relative flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            {/* Left */}
            <div className="min-w-0 space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 text-base font-bold text-white shadow-lg shadow-blue-600/25">
                  {(studentName ?? "S").trim().charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {studentName ?? "Student"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Personal attendance overview
                  </p>
                </div>
              </div>

              <div>
                <h2 className="bg-linear-to-r from-slate-900 via-slate-700 to-slate-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl dark:from-white dark:via-slate-200 dark:to-slate-400">
                  Attendance Report
                </h2>
                <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
                  Track your presence class by class —{" "}
                  <span className="font-medium text-foreground">
                    {sessionCount}
                  </span>{" "}
                  session{sessionCount !== 1 ? "s" : ""} recorded
                  {fromDate || toDate
                    ? " in the selected date range"
                    : " across all time"}
                  .
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {presentCount} Present
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  {absentCount} Absent
                </span>
                <Badge
                  variant="secondary"
                  className="rounded-full bg-white/70 text-[11px] font-medium backdrop-blur dark:bg-white/10"
                >
                  {dateFiltered.length} record
                  {dateFiltered.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </div>

            {/* Right — rate ring */}
            <div className="flex items-center justify-center lg:justify-end">
              <RateRing rate={rate} />
            </div>
          </div>
        </section>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={<BookOpenCheck className="h-6 w-6" />}
            label="Sessions"
            value={sessionCount}
            gradient="from-blue-500 to-indigo-600"
            glow="bg-blue-400/40"
          />
          <StatCard
            icon={<UserCheck className="h-6 w-6" />}
            label="Present"
            value={presentCount}
            gradient="from-emerald-500 to-teal-600"
            glow="bg-emerald-400/40"
          />
          <StatCard
            icon={<UserX className="h-6 w-6" />}
            label="Absent"
            value={absentCount}
            gradient="from-red-500 to-rose-600"
            glow="bg-red-400/40"
          />
          <StatCard
            icon={<TrendingUp className="h-6 w-6" />}
            label="Rate"
            value={`${rate}%`}
            gradient="from-violet-500 to-purple-600"
            glow="bg-violet-400/40"
          />
        </div>

        {/* Attendance by subject */}
        <section className={cn("relative overflow-hidden rounded-3xl", GLASS)}>
          <div className="relative border-b border-white/50 px-5 py-5 sm:px-7 dark:border-white/10">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500/20 to-violet-500/20 ring-1 ring-indigo-500/20">
                <BookOpenCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Attendance by Subject
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Subject-wise breakdown of your presence
                </p>
              </div>
            </div>
          </div>

          {subjectBreakdown.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500/15 to-indigo-500/15 ring-1 ring-blue-500/20">
                <BookOpenCheck className="h-6 w-6 text-blue-500/70" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                No attendance records yet.
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Subject-wise attendance will appear here once records exist.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/50 dark:divide-white/5">
              {subjectBreakdown.map((s) => {
                const tone = getRateTone(s.rate);
                return (
                  <div
                    key={s.name}
                    className="relative flex flex-col gap-4 px-5 py-4 transition-colors duration-300 hover:bg-white/40 sm:flex-row sm:items-center sm:gap-6 sm:px-7 dark:hover:bg-white/5"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-md shadow-blue-600/20">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {s.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {s.total} class{s.total !== 1 ? "es" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-500/25">
                        <CheckCircle2 className="h-3 w-3" />
                        {s.present}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-500/25">
                        <XCircle className="h-3 w-3" />
                        {s.absent}
                      </span>
                    </div>

                    <div className="flex min-w-40 flex-[1.4] items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700/50">
                        <div
                          className={cn(
                            "h-full rounded-full bg-linear-to-r transition-all duration-700 ease-out",
                            tone.fill,
                          )}
                          style={{ width: `${s.rate}%` }}
                        />
                      </div>
                      <span
                        className={cn(
                          "w-12 shrink-0 rounded-full px-2 py-0.5 text-center text-[11px] font-bold tabular-nums ring-1",
                          tone.chip,
                        )}
                      >
                        {s.rate}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Records */}
        <section className={cn("relative overflow-hidden rounded-3xl", GLASS)}>
          <div className="relative border-b border-white/50 px-5 py-5 sm:px-7 dark:border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-500/20 to-cyan-500/20 ring-1 ring-blue-500/20">
                  <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Attendance Records
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Every marked class, newest first
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="rounded-full bg-white/70 text-[11px] font-medium backdrop-blur dark:bg-white/10"
              >
                {filtered.length} record{filtered.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          </div>

          <div className="space-y-5 p-5 sm:p-7">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 xl:flex-row xl:flex-wrap xl:items-center xl:justify-between">
              <div className="relative w-full xl:max-w-xs">
                <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => changeSearch(e.target.value)}
                  placeholder="Search subject, class or teacher…"
                  className="h-10 rounded-xl border-white/60 bg-white/60 pl-10 text-sm shadow-sm backdrop-blur focus-visible:ring-blue-500/30 dark:border-white/10 dark:bg-white/5"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <label className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-white/60 bg-white/60 pr-3 pl-3.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur transition-colors hover:bg-white/80 dark:border-white/10 dark:bg-white/5">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                  From
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => changeFromDate(e.target.value)}
                    className="w-32 bg-transparent text-xs font-semibold text-foreground outline-none [color-scheme:light]"
                    aria-label="From date"
                  />
                </label>
                <label className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-white/60 bg-white/60 pr-3 pl-3.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur transition-colors hover:bg-white/80 dark:border-white/10 dark:bg-white/5">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                  To
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => changeToDate(e.target.value)}
                    className="w-32 bg-transparent text-xs font-semibold text-foreground outline-none [color-scheme:light]"
                    aria-label="To date"
                  />
                </label>
              </div>

              {/* Segmented status control */}
              <div className="flex items-center gap-1 self-start rounded-2xl border border-white/60 bg-white/50 p-1 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => changeStatus(tab.key)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-300",
                      statusFilter === tab.key
                        ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25"
                        : "text-slate-500 hover:bg-white/70 dark:text-slate-400 dark:hover:bg-white/10",
                    )}
                  >
                    {tab.label}
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none tabular-nums",
                        statusFilter === tab.key
                          ? "bg-white/20 text-white"
                          : "bg-slate-900/5 text-slate-500 dark:bg-white/10 dark:text-slate-400",
                      )}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-slate-500/10 to-slate-500/5 ring-1 ring-slate-500/20">
                  <Search className="h-6 w-6 text-muted-foreground/60" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {records.length === 0
                    ? "No attendance records yet."
                    : searchTerm
                      ? "No records match your search."
                      : "No records in the selected range."}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  {records.length === 0
                    ? "Your attendance will appear here once classes are marked."
                    : "Try adjusting the filters above."}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-2xl border border-white/60 shadow-inner dark:border-white/10">
                  <Table className="[&_td]:border-white/40 [&_th]:border-white/40 dark:[&_td]:border-white/5 dark:[&_th]:border-white/5">
                    <TableHeader>
                      <TableRow className="bg-linear-to-r from-blue-500/[0.07] via-transparent to-violet-500/[0.07] hover:from-blue-500/[0.07]">
                        <TableHead className="h-11 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                          Date
                        </TableHead>
                        <TableHead className="h-11 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                          Class/Year
                        </TableHead>
                        <TableHead className="h-11 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                          Course Code
                        </TableHead>
                        <TableHead className="h-11 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                          Group
                        </TableHead>
                        <TableHead className="h-11 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                          Teacher
                        </TableHead>
                        <TableHead className="h-11 text-center text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagedRecords.map((r) => {
                        const isPresent = r.attendance_status === "PRESENT";
                        return (
                          <TableRow
                            key={r.id}
                            className="transition-colors hover:bg-blue-500/[0.05]"
                          >
                            <TableCell className="whitespace-nowrap">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={cn(
                                    "h-7 w-1 shrink-0 rounded-full",
                                    isPresent
                                      ? "bg-emerald-500/70"
                                      : "bg-red-500/70",
                                  )}
                                />
                                <div>
                                  <p className="text-sm font-semibold">
                                    {formatDate(r.attendance_date)}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground">
                                    {getWeekday(r.attendance_date)}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm font-medium whitespace-nowrap">
                              {r.academicClass?.class_name ?? "—"}
                            </TableCell>
                            <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                              {r.subject?.name ?? "—"}
                            </TableCell>
                            <TableCell>
                              {r.group ? (
                                <span className="inline-flex rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 ring-1 ring-blue-500/20 dark:text-blue-400">
                                  {r.group}
                                </span>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  —
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                              {r.teacher?.full_name ?? "—"}
                            </TableCell>
                            <TableCell className="text-center">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1",
                                  isPresent
                                    ? "bg-emerald-500/15 text-emerald-600 ring-emerald-500/25"
                                    : "bg-red-500/15 text-red-600 ring-red-500/25",
                                )}
                              >
                                <span
                                  className={cn(
                                    "h-1.5 w-1.5 rounded-full",
                                    isPresent ? "bg-emerald-500" : "bg-red-500",
                                  )}
                                />
                                {isPresent ? "Present" : "Absent"}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                  <p className="text-xs text-muted-foreground">
                    Showing{" "}
                    <span className="font-semibold text-foreground">
                      {startIndex}
                    </span>
                    –{endIndex} of{" "}
                    <span className="font-semibold text-foreground">
                      {filtered.length}
                    </span>{" "}
                    records
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() => setCurrentPage(safePage - 1)}
                      className={cn(
                        "inline-flex h-8 items-center gap-1 rounded-xl border border-white/60 bg-white/60 px-3 text-xs font-semibold shadow-sm backdrop-blur transition-all dark:border-white/10 dark:bg-white/5",
                        safePage <= 1
                          ? "cursor-not-allowed opacity-40"
                          : "hover:-translate-y-px hover:bg-white/90 active:scale-95 dark:hover:bg-white/10",
                      )}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Prev
                    </button>
                    <span className="rounded-xl bg-slate-900/5 px-3 py-1.5 text-xs font-semibold tabular-nums dark:bg-white/10">
                      {safePage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={safePage >= totalPages}
                      onClick={() => setCurrentPage(safePage + 1)}
                      className={cn(
                        "inline-flex h-8 items-center gap-1 rounded-xl border border-white/60 bg-white/60 px-3 text-xs font-semibold shadow-sm backdrop-blur transition-all dark:border-white/10 dark:bg-white/5",
                        safePage >= totalPages
                          ? "cursor-not-allowed opacity-40"
                          : "hover:-translate-y-px hover:bg-white/90 active:scale-95 dark:hover:bg-white/10",
                      )}
                    >
                      Next
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentAttendanceReport;
