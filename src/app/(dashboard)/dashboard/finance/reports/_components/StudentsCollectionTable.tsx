import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StudentCollectionSummary } from "./types/collectionReport";

interface StudentsCollectionTableProps {
  students: StudentCollectionSummary[];
}

const formatAmount = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

export function StudentsCollectionTable({
  students,
}: StudentsCollectionTableProps) {
  if (students.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-slate-400">
        No student collection data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>#</TableHead>
            <TableHead>Student Name</TableHead>
            <TableHead>Registration No</TableHead>
            <TableHead>Class/Year</TableHead>
            <TableHead className="text-right">Total Collected</TableHead>
            <TableHead className="text-right">Collections</TableHead>
            <TableHead>Last Collection</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student, index) => (
            <TableRow key={student.student_id}>
              <TableCell className="text-slate-500">{index + 1}</TableCell>
              <TableCell className="font-medium">
                {student.student_name}
              </TableCell>
              <TableCell className="text-slate-500">
                {student.registration_number || "—"}
              </TableCell>
              <TableCell>{student.class_name}</TableCell>
              <TableCell className="text-right font-medium">
                ৳{formatAmount(student.totalAmount)}
              </TableCell>
              <TableCell className="text-right">
                {formatAmount(student.collectionCount)}
              </TableCell>
              <TableCell>{student.lastCollectionDate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}