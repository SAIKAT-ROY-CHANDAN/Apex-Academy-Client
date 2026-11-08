import { ClipboardCheck, Eye, Users } from "lucide-react";
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
import Link from "next/link";

const currency = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
});

export type StaffAttendanceReportRow = {
  staff_id: string;
  staff_name: string;
  phone: string;
  total_days: number;
  present: number;
  absent: number;
  attendance_percentage: number;
  overtime_hours?: number;
  overtime_hourly_rate?: number;
  overtime_amount?: number;
};

interface StaffAttendanceReportTableProps {
  data: StaffAttendanceReportRow[];
  totalStaffs: number;
  totalRecords: number;
  totalOvertimeHours?: number;
  totalOvertimeAmount?: number;
}

const StaffAttendanceReportTable = ({
  data,
  totalStaffs,
  totalRecords,
  totalOvertimeHours = 0,
  totalOvertimeAmount = 0,
}: StaffAttendanceReportTableProps) => {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
          Attendance Report
        </CardTitle>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>
            Staffs:{" "}
            <span className="font-semibold text-foreground">{totalStaffs}</span>
          </span>
          <span>
            Records:{" "}
            <span className="font-semibold text-foreground">
              {totalRecords}
            </span>
          </span>
          <span>
            OT Hours:{" "}
            <span className="font-semibold text-foreground">
              {Number(totalOvertimeHours ?? 0).toFixed(2)} hr
            </span>
          </span>
          <span>
            OT Amount:{" "}
            <span className="font-semibold text-foreground">
              {currency.format(Number(totalOvertimeAmount ?? 0))}
            </span>
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              No attendance data found.
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
                    Staff Name
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Phone
                  </TableHead>
                  <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Days
                  </TableHead>
                  <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Present
                  </TableHead>
                  <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Absent
                  </TableHead>
                  <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Attendance %
                  </TableHead>
                  <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    OT Hours
                  </TableHead>
                  <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    OT Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => {
                  const otHours = Number(row.overtime_hours ?? 0);
                  const otAmount = Number(row.overtime_amount ?? 0);
                  return (
                    <TableRow
                      key={row.staff_id}
                      className="cursor-pointer transition-colors hover:bg-muted/20"
                    >
                      <TableCell className="text-center text-xs text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/dashboard/employees/staffs/attendance-reports/${row.staff_id}`}
                          className="hover:underline"
                        >
                          {row.staff_name}
                        </Link>
                        <div className="mt-0.5">
                          <Link
                            href={`/dashboard/employees/staffs/attendance-reports/${row.staff_id}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                          >
                            <Eye className="h-3 w-3" />
                            View Details
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {row.phone}
                      </TableCell>
                      <TableCell className="text-center text-sm font-semibold">
                        {row.total_days}
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
                      <TableCell className="text-center">
                        <Badge
                          variant="secondary"
                          className={`text-xs font-semibold ${
                            row.attendance_percentage >= 80
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                              : row.attendance_percentage >= 50
                                ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                                : "bg-red-100 text-red-700 hover:bg-red-100"
                          }`}
                        >
                          {row.attendance_percentage}%
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-center text-sm font-medium tabular-nums">
                        {otHours > 0 ? (
                          `${otHours.toFixed(2)} hr`
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-center text-sm font-medium tabular-nums">
                        {otAmount > 0 ? (
                          currency.format(otAmount)
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
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
  );
};

export default StaffAttendanceReportTable;
