import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  CalendarCheck,
  CalendarX,
  Clock,
  LogIn,
  LogOut,
  Timer,
  Users,
} from "lucide-react";
import { formatTeacherType } from "@/constant/teacher/teacherType";
import { ADMINISTRATIVE_POSITION_LABELS } from "../../_constants";

export type TeacherAttendanceHistoryData = {
  teacher: {
    id: string;
    full_name: string;
    email: string | null;
    phone: string;
    photo: string | null;
    gender: string;
    teacher_type: string;
    administrative_position: string | null;
    is_active: boolean;
    designation: { id: string; name: string } | null;
    department: { id: string; department_name: string } | null;
    shift: {
      id: string;
      name: string;
      start_time: string;
      end_time: string;
    } | null;
  };
  summary: {
    totalDays: number;
    present: number;
    absent: number;
    attendancePercentage: number;
  };
  data: {
    id: string;
    attendance_date: string;
    attendance_status: string;
    check_in_time: string;
    check_out_time: string | null;
    created_at: string;
  }[];
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatTime = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { weekday: "short" });

const getDuration = (checkIn: string, checkOut: string | null) => {
  if (!checkOut) return "—";
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  if (ms <= 0) return "—";
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const StatCard = ({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  tone: string;
}) => (
  <Card className="border-border/50 shadow-sm">
    <CardContent className="flex items-center gap-4 p-4">
      <div className={`rounded-xl p-2.5 ${tone}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold tabular-nums">{value}</p>
      </div>
    </CardContent>
  </Card>
);

const TeacherAttendanceHistory = ({
  history,
}: {
  history: TeacherAttendanceHistoryData;
}) => {
  const { teacher, summary, data } = history;

  return (
    <div className="space-y-6">
      {/* Teacher info */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">
            Teacher Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <Avatar className="h-16 w-16">
              <AvatarImage src={teacher.photo ?? undefined} />
              <AvatarFallback className="text-lg">
                {getInitials(teacher.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold">{teacher.full_name}</h3>
                <Badge
                  variant={teacher.is_active ? "default" : "secondary"}
                  className="text-[10px]"
                >
                  {teacher.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {teacher.phone}
                {teacher.email ? ` · ${teacher.email}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-[11px] font-medium">
                  {formatTeacherType(teacher.teacher_type)}
                </Badge>
                {teacher.administrative_position && (
                  <Badge
                    variant="outline"
                    className="text-[11px] font-medium"
                  >
                    {
                      ADMINISTRATIVE_POSITION_LABELS[
                        teacher.administrative_position
                      ]
                    }
                  </Badge>
                )}
                {teacher.designation && (
                  <Badge variant="secondary" className="text-[11px] font-medium">
                    {teacher.designation.name}
                  </Badge>
                )}
                {teacher.department && (
                  <Badge variant="secondary" className="text-[11px] font-medium">
                    {teacher.department.department_name}
                  </Badge>
                )}
                {teacher.shift && (
                  <Badge variant="secondary" className="text-[11px] font-medium">
                    {teacher.shift.name} ({teacher.shift.start_time} -{" "}
                    {teacher.shift.end_time})
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CalendarCheck}
          label="Total Days"
          value={summary.totalDays}
          tone="bg-blue-500/10 text-blue-600"
        />
        <StatCard
          icon={Users}
          label="Present"
          value={summary.present}
          tone="bg-emerald-500/10 text-emerald-600"
        />
        <StatCard
          icon={CalendarX}
          label="Absent"
          value={summary.absent}
          tone="bg-red-500/10 text-red-600"
        />
        <StatCard
          icon={Timer}
          label="Attendance %"
          value={`${summary.attendancePercentage}%`}
          tone="bg-amber-500/10 text-amber-600"
        />
      </div>

      {/* Records */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Attendance Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CalendarCheck className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                No attendance records found.
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                This teacher has no attendance recorded yet.
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
                      Day
                    </TableHead>
                    <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Check In
                    </TableHead>
                    <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Check Out
                    </TableHead>
                    <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Duration
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((record, index) => (
                    <TableRow
                      key={record.id}
                      className="transition-colors hover:bg-muted/20"
                    >
                      <TableCell className="text-center text-xs text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm font-medium">
                        {formatDate(record.attendance_date)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatDay(record.attendance_date)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={`gap-1 text-xs font-medium ${
                            record.attendance_status === "PRESENT"
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                              : "bg-red-100 text-red-700 hover:bg-red-100"
                          }`}
                        >
                          {record.attendance_status === "PRESENT" ? (
                            <LogIn className="h-3 w-3" />
                          ) : (
                            <LogOut className="h-3 w-3" />
                          )}
                          {record.attendance_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-center text-sm tabular-nums">
                        {formatTime(record.check_in_time)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-center text-sm tabular-nums">
                        {formatTime(record.check_out_time)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-center text-sm tabular-nums text-muted-foreground">
                        {getDuration(record.check_in_time, record.check_out_time)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherAttendanceHistory;
