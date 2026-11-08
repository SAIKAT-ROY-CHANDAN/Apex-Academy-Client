"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MONTHS } from "@/constant/payroll/teacher-payroll";
import { TeacherPayrollHistoryRow } from "@/services/payroll/teachers-payroll";
import { Download, FileText } from "lucide-react";
import { handleDownloadPaymentReceipt } from "../../_components/PayrollInvoiceReceipt";

const currency = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

const getMonthLabel = (month: number) =>
  MONTHS.find((m) => Number(m.value) === month)?.label ?? month;

const PayrollHistoryTable = ({
  rows,
}: {
  rows: TeacherPayrollHistoryRow[];
}) => {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              No payment history found.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Try adjusting the month or year filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="h-10 w-14 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    SL
                  </TableHead>
                  <TableHead className="h-10 min-w-28 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Period
                  </TableHead>
                  <TableHead className="h-10 min-w-32 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Amount
                  </TableHead>
                  <TableHead className="h-10 min-w-32 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Method
                  </TableHead>
                  <TableHead className="h-10 min-w-40 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Reference
                  </TableHead>
                  <TableHead className="h-10 min-w-32 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Paid On
                  </TableHead>
                  <TableHead className="h-10 min-w-32 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Paid By
                  </TableHead>
                  <TableHead className="h-10 min-w-28 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Invoice
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={row.paymentId} className="hover:bg-muted/20">
                    <TableCell className="text-center text-xs text-muted-foreground">
                      {String(row.sl ?? index + 1).padStart(2, "0")}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-foreground">
                      {getMonthLabel(row.month)} {row.year}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-foreground">
                      {currency.format(row.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {row.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.paymentMethod === "BKASH"
                        ? (row.transactionId ?? "—")
                        : (row.paymentNote ?? "—")}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(row.paidAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.paidByAdmin}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 rounded-full text-xs"
                        onClick={() => handleDownloadPaymentReceipt(row)}
                        type="button"
                      >
                        <Download className="h-3.5 w-3.5" />
                        PDF
                      </Button>
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

export default PayrollHistoryTable;
