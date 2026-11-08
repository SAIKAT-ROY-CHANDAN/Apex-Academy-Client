import { Clock, Users } from "lucide-react";
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
import type { TTeacher } from "@/types/modules/teacher/teacher.type";
import CheckInToggle from "./CheckInToggle";
import CheckOutToggle from "./CheckOutToggle";
import OvertimeButton, { TOvertimeStatus } from "./OvertimeButton";
import { formatTeacherType } from "@/constant/teacher/teacherType";

type TAttendanceStatus = {
  isCheckIn: boolean;
  checkInId?: string;
  isCheckOut: boolean;
};

type TeacherAttendanceTableProps = {
  teachers: TTeacher[];
  attendanceMap: Record<string, TAttendanceStatus>;
  overtimeMap?: Record<string, TOvertimeStatus>;
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const TeacherAttendanceTable = ({
  teachers,
  attendanceMap,
  overtimeMap = {},
}: TeacherAttendanceTableProps) => {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Attendance Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {!teachers || teachers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              No teachers found.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Add a teacher to get started.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="h-10 w-12 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  SN
                </TableHead>
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Name
                </TableHead>
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Type
                </TableHead>
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Designation
                </TableHead>
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Department
                </TableHead>
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Shift
                </TableHead>
                <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Check In
                </TableHead>
                <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Check Out
                </TableHead>
                <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Overtime
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher, index) => {
                const status = attendanceMap[teacher.id as string] ?? {
                  isCheckIn: false,
                  isCheckOut: false,
                };

                return (
                  <TableRow
                    key={teacher.id}
                    className="group transition-colors hover:bg-muted/20"
                  >
                    <TableCell className="text-center text-xs text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={teacher.photo}
                            alt={teacher.full_name}
                          />
                          <AvatarFallback className="text-xs">
                            {getInitials(teacher.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">
                          {teacher.full_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="text-xs font-medium capitalize"
                      >
                        {formatTeacherType(teacher.teacher_type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {teacher.designation?.name ?? "N/A"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {teacher.department?.department_name ?? "N/A"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {teacher.shift?.name ?? "N/A"}
                    </TableCell>
                    <TableCell className="text-center">
                      <CheckInToggle
                        teacherId={teacher.id as string}
                        hasCheckIn={status.isCheckIn}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <CheckOutToggle
                        attendanceId={status.checkInId}
                        hasCheckIn={status.isCheckIn}
                        hasCheckOut={status.isCheckOut}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <OvertimeButton
                        teacherId={teacher.id}
                        hasCheckOut={status.isCheckOut}
                        overtime={overtimeMap[teacher.id as string]}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default TeacherAttendanceTable;
