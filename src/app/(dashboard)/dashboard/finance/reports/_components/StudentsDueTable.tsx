import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StudentDue } from "./types/dueReport";

interface StudentsDueTableProps {
  students: StudentDue[];
}

const formatAmount = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

export function StudentsDueTable({ students }: StudentsDueTableProps) {
  if (students.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-slate-400">
        No students with due amounts found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {students.map((student) => (
        <div
          key={student.student_id}
          className="overflow-hidden rounded-lg border border-slate-200"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 px-4 py-3">
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-slate-800">
                {student.student_name}
              </h4>
              <p className="mt-0.5 text-xs text-slate-500">
                {student.class_name}
                {student.session_name ? ` • ${student.session_name}` : ""}
                {student.registration_number
                  ? ` • Reg: ${student.registration_number}`
                  : ""}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-600">
                Paid:{" "}
                <strong className="text-emerald-600">
                  ৳{formatAmount(student.totalPaidAmount)}
                </strong>
              </span>
              <span className="text-slate-600">
                Due:{" "}
                <strong className="text-rose-600">
                  ৳{formatAmount(student.dueAmount)}
                </strong>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Fee Item</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Scholarship</TableHead>
                  <TableHead className="text-right">Fine</TableHead>
                  <TableHead className="text-right">Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.feeItems.length > 0 ? (
                  student.feeItems.map((item, index) => (
                    <TableRow key={`${student.student_id}-${index}`}>
                      <TableCell className="font-medium">
                        {item.fee_item_name}
                      </TableCell>
                      <TableCell className="text-right">
                        ৳{formatAmount(item.line_total_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        ৳{formatAmount(item.paid_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        ৳{formatAmount(item.discount_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        ৳{formatAmount(item.fine_amount)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-rose-600">
                        ৳{formatAmount(item.due_amount)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-sm text-slate-400"
                    >
                      No fee item details
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
}