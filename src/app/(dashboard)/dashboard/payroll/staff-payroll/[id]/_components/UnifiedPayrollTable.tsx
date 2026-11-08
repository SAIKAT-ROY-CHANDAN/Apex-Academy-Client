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
import { Download, HandCoins, Wallet } from "lucide-react";
import type { SalaryAdvance } from "@/types/modules/payroll";
import { formatDate } from "@/lib/utils";

export { formatDate };

const currency = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

/* -------------------------------------------------------------------------- */
/*  Row shapes                                                                */
/* -------------------------------------------------------------------------- */

export type PaymentRow<T = unknown> = {
  kind: "payment";
  id: string;
  sl: number;
  date: string;
  period: string;
  amount: number;
  method: string;
  reference: string;
  detail: string;
  paidByAdmin: string;
  raw: T;
};

export type AdvanceRow = {
  kind: "advance";
  id: string;
  sl: number;
  date: string;
  amount: number;
  method: string;
  reference: string;
  detail: string;
  note: string;
  paidByAdmin?: string;
  raw: SalaryAdvance;
};

export type UnifiedRow<T = unknown> = PaymentRow<T> | AdvanceRow;

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

type UnifiedPayrollTableProps<T = unknown> = {
  rows: UnifiedRow<T>[];
  onDownloadPayment: (raw: T) => void;
  onDownloadAdvance: (raw: SalaryAdvance) => void;
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

const UnifiedPayrollTable = <T,>({
  rows,
  onDownloadPayment,
  onDownloadAdvance,
}: UnifiedPayrollTableProps<T>) => {
  const hasPayments = rows.some((row) => row.kind === "payment");
  const hasAdvances = rows.some((row) => row.kind === "advance");

  const showPeriodColumn = hasPayments && !hasAdvances;
  const showDateColumn = hasAdvances && !hasPayments;
  const showDateOrPeriodColumn = hasPayments && hasAdvances;

  const dateOrPeriodLabel = showDateOrPeriodColumn
    ? "Date / Period"
    : showDateColumn
      ? "Date"
      : "Period";

  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Wallet className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              No records found.
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
                  <TableHead className="h-10 min-w-24 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Type
                  </TableHead>
                  <TableHead className="h-10 min-w-32 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {dateOrPeriodLabel}
                  </TableHead>
                  <TableHead className="h-10 min-w-32 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Amount
                  </TableHead>
                  <TableHead className="h-10 min-w-28 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Method
                  </TableHead>
                  <TableHead className="h-10 min-w-40 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Details
                  </TableHead>
                  <TableHead className="h-10 min-w-40 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Paid By
                  </TableHead>
                  <TableHead className="h-10 min-w-40 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Note
                  </TableHead>
                  <TableHead className="h-10 min-w-24 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    PDF
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={`${row.kind}-${row.id}`}
                    className="hover:bg-muted/20"
                  >
                    <TableCell className="text-center text-xs text-muted-foreground">
                      {String(row.sl).padStart(2, "0")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          row.kind === "payment"
                            ? "border-blue-200 bg-blue-50 text-blue-600"
                            : "border-amber-200 bg-amber-50 text-amber-600"
                        }
                      >
                        {row.kind === "payment" ? (
                          <Wallet className="mr-1 h-3 w-3" />
                        ) : (
                          <HandCoins className="mr-1 h-3 w-3" />
                        )}
                        {row.kind === "payment" ? "Payment" : "Advance"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-foreground">
                      {row.kind === "payment" ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">
                            {row.period}
                          </span>
                          {row.date && (
                            <span className="text-xs text-muted-foreground">
                              Paid: {formatDate(row.date)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">
                            {formatDate(row.date)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Advance Issued
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-foreground">
                      {currency.format(row.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {row.method}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.detail}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.paidByAdmin || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.kind === "advance" ? row.note : "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 rounded-full text-xs"
                        onClick={() =>
                          row.kind === "payment"
                            ? onDownloadPayment(row.raw)
                            : onDownloadAdvance(row.raw)
                        }
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

export default UnifiedPayrollTable;
