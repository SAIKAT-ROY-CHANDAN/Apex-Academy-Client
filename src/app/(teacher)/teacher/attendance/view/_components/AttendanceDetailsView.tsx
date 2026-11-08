import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  FileText,
  GraduationCap,
  Percent,
  Users,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { TStudentAttendanceDetail } from "@/types/modules/teacher/attendance.type";

type AttendanceDetailsViewProps = {
  attendanceDate: string;
  classNameLabel: string;
  subjectName?: string;
  groupName?: string;
  records: TStudentAttendanceDetail[];
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const formatDate = (date: string) => {
  if (!date) return "N/A";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const SummaryCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="rounded-2xl border border-border/50 bg-white p-4 shadow-sm">
    <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
      {icon}
      {label}
    </p>
    <p className="mt-1.5 truncate text-sm font-bold text-foreground">{value}</p>
  </div>
);

const AttendanceDetailsView = ({
  attendanceDate,
  classNameLabel,
  subjectName,
  groupName,
  records,
}: AttendanceDetailsViewProps) => {
  const present = records.filter((r) => r.attendance_status === "PRESENT");
  const absent = records.filter((r) => r.attendance_status === "ABSENT");
  const rate =
    records.length === 0
      ? 0
      : Math.round((present.length / records.length) * 100);

  return (
    <div className="space-y-6">
      {/* Session summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          icon={<CalendarDays className="h-3.5 w-3.5" />}
          label="Date"
          value={formatDate(attendanceDate)}
        />
        <SummaryCard
          icon={<BookOpen className="h-3.5 w-3.5" />}
          label="Class/Year"
          value={classNameLabel || "—"}
        />
        <SummaryCard
          icon={<GraduationCap className="h-3.5 w-3.5" />}
          label="Subject"
          value={subjectName && subjectName !== "N/A" ? subjectName : "—"}
        />
        <SummaryCard
          icon={<Users className="h-3.5 w-3.5" />}
          label="Group"
          value={groupName || "—"}
        />
      </div>

      {/* Stats */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100">
          <CheckCircle2 className="h-4 w-4" />
          {present.length} Present
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 ring-1 ring-red-100">
          <UserX className="h-4 w-4" />
          {absent.length} Absent
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-border">
          <Users className="h-4 w-4" />
          {records.length} Total
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1",
            rate >= 75
              ? "bg-blue-50 text-blue-700 ring-blue-100"
              : "bg-amber-50 text-amber-700 ring-amber-100",
          )}
        >
          <Percent className="h-4 w-4" />
          {rate}% Rate
        </span>
      </div>

      {/* Student lists */}
      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white py-16 text-center">
          <Users className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">
            No attendance records found for this session.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <StudentList
            title="Present"
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
            count={present.length}
            countClass="bg-emerald-100 text-emerald-700"
            records={present}
          />
          <StudentList
            title="Absent"
            icon={<UserX className="h-4 w-4 text-red-600" />}
            count={absent.length}
            countClass="bg-red-100 text-red-700"
            records={absent}
          />
        </div>
      )}
    </div>
  );
};

const StudentList = ({
  title,
  icon,
  count,
  countClass,
  records,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  countClass: string;
  records: TStudentAttendanceDetail[];
}) => (
  <section className="rounded-2xl border border-border/50 bg-white shadow-sm">
    <header className="flex items-center gap-2 border-b border-border/50 px-5 py-4">
      {icon}
      <h4 className="text-sm font-semibold">{title}</h4>
      <span
        className={`ml-auto inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-bold ${countClass}`}
      >
        {count}
      </span>
    </header>
    <div className="max-h-[480px] space-y-2 overflow-y-auto p-4">
      {records.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">None</p>
      ) : (
        records.map((r) => <StudentRow key={r.id} record={r} />)
      )}
    </div>
  </section>
);

const StudentRow = ({ record }: { record: TStudentAttendanceDetail }) => {
  const name = record.student?.name ?? "Unknown Student";
  const isPresent = record.attendance_status === "PRESENT";
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-background p-2.5 shadow-sm transition-colors hover:bg-muted/30">
      <Avatar size="sm">
        {record.student?.photo ? (
          <AvatarImage src={record.student.photo} alt={name} />
        ) : null}
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {record.student?.father_name || "Father: —"}
        </p>
      </div>
      <Link
        href={`/teacher/attendance/view/student-report?student_id=${record.student_id}&student_name=${encodeURIComponent(name)}`}
        className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100"
      >
        <FileText className="h-3.5 w-3.5" />
        View Report
      </Link>
      <span
        className={cn(
          "inline-flex h-6 w-6 items-center justify-center rounded-full",
          isPresent
            ? "bg-emerald-100 text-emerald-700"
            : "bg-red-100 text-red-700",
        )}
        title={isPresent ? "Present" : "Absent"}
      >
        {isPresent ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <UserX className="h-4 w-4" />
        )}
      </span>
    </div>
  );
};

export default AttendanceDetailsView;
