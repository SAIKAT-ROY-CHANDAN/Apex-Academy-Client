import { BookOpenCheck, Users } from "lucide-react";
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

export type ClassTakenReportRow = {
  attendance_date: string;
  teacher_id: string | null;
  teacher_name: string;
  academic_class_id: string | null;
  class_name: string;
  subject_id: string | null;
  subject_name: string;
  group: string | null;
  total: number;
  present: number;
  absent: number;
};

interface ClassTakenReportTableProps {
  data: ClassTakenReportRow[];
  totalRecords: number;
}

// const formatDate = (date: string) => {
//   if (!date) return "N/A";
//   const datePart = date.split("T")[0] ?? date.split(" ")[0] ?? date;
//   const timePart = date.includes("T")
//     ? date.split("T")[1]
//     : date.includes(" ")
//       ? date.split(" ")[1]
//       : null;
//   const [y, m, d] = datePart.split("-");
//   if (!y || !m || !d) return date;
//   const formattedDate = `${d}-${m}-${y}`;
//   if (timePart) {
//     const [hh, mm] = timePart.split(":");
//     if (hh && mm) {
//       const hour = Number.parseInt(hh, 10);
//       const period = hour >= 12 ? "PM" : "AM";
//       const h12 = hour % 12 || 12;
//       return `${formattedDate} ${h12}:${mm} ${period}`;
//     }
//   }
//   return formattedDate;
// };

const ClassTakenReportTable = ({
  data,
  totalRecords,
}: ClassTakenReportTableProps) => {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <BookOpenCheck className="h-5 w-5 text-muted-foreground" />
          Classes Taken
        </CardTitle>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            Classes:{" "}
            <span className="font-semibold text-foreground">{data.length}</span>
          </span>
          <span>
            Records:{" "}
            <span className="font-semibold text-foreground">
              {totalRecords}
            </span>
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              No classes found.
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
                    Class
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Course Code
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow
                    key={`${row.attendance_date}|${row.teacher_id ?? ""}|${row.academic_class_id ?? ""}|${row.subject_id ?? ""}|${row.group ?? ""}|${index}`}
                    className="transition-colors hover:bg-muted/20"
                  >
                    <TableCell className="text-center text-xs text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm font-medium">
                      {new Date(row.attendance_date).toLocaleString("en-GB", {
                        timeZone: "Asia/Dhaka",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {row.teacher_name}
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
                        <span className="text-sm text-muted-foreground">—</span>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClassTakenReportTable;
