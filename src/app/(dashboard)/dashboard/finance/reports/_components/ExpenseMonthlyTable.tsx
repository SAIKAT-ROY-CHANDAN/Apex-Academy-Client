import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ExpenseMonth } from "./types/expenseReport";

interface ExpenseMonthlyTableProps {
  data: ExpenseMonth[];
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const formatAmount = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

export function ExpenseMonthlyTable({ data }: ExpenseMonthlyTableProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-slate-400">
        No expense data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((month) => {
        const monthName =
          MONTH_NAMES[Number(month.month.split("-")[1]) - 1] ?? month.month;
        const year = month.month.split("-")[0];

        return (
          <div
            key={month.month}
            className="overflow-hidden rounded-lg border border-slate-200"
          >
            <div className="flex items-center justify-between bg-slate-50 px-4 py-3">
              <h4 className="text-sm font-semibold text-slate-800">
                {monthName} {year}
              </h4>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-600">
                  Total: <strong>৳{formatAmount(month.totalAmount)}</strong>
                </span>
                <span className="text-slate-500">
                  {formatAmount(month.expenseCount)} entries
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Expense Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {month.days.length > 0 ? (
                    month.days.map((day) => (
                      <TableRow key={day.date}>
                        <TableCell className="font-medium">
                          {day.date}
                        </TableCell>
                        <TableCell className="text-right">
                          ৳{formatAmount(day.totalAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatAmount(day.expenseCount)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-sm text-slate-400"
                      >
                        No day-level data
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        );
      })}
    </div>
  );
}