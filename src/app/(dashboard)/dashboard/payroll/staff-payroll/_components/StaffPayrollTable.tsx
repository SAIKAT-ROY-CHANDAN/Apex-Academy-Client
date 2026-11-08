"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { StaffFilterValues, StaffPayrollRow } from "@/types/modules/payroll";
import StaffAdvanceSalaryDialog from "./StaffAdvanceSalaryDialog";
import StaffPayrollPaymentDialog from "./StaffPayrollPaymentDialog";
import {
  AdvanceSalaryInvoiceIcon,
  handleDownloadReceipt,
  ViewPayrollButton,
} from "./PayrollInvoiceReceipt";
import {
  ArrowUpDown,
  BadgeCheck,
  Banknote,
  Calendar,
  ChevronDown,
  Eye,
  HandCoins,
  Landmark,
  MoreHorizontal,
  Smartphone,
  Sparkles,
  Wallet,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { MONTHS } from "@/constant/payroll/teacher-payroll";
import Link from "next/link";

const currency = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years: { value: string; label: string }[] = [];
  for (let y = currentYear - 5; y <= currentYear + 2; y++) {
    years.push({ value: String(y), label: String(y) });
  }
  return years;
};

type StaffPayrollTableProps = {
  rows: StaffPayrollRow[];
  currentFilters: StaffFilterValues;
  selectedMonth: number;
  selectedYear: number;
};

const StaffPayrollTable = ({
  rows,
  currentFilters,
  selectedMonth,
  selectedYear,
}: StaffPayrollTableProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK" | "BKASH" | null>(
    null,
  );
  const [paymentStaff, setPaymentStaff] = useState<StaffPayrollRow | null>(
    null,
  );
  const [advanceDialogOpen, setAdvanceDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffPayrollRow | null>(
    null,
  );

  const formatMoney = (amount: number) => currency.format(amount);

  const isPaid = (status?: string) => status === "PAID";

  const statusLabel = (status?: string) =>
    status === "PAID"
      ? "Paid"
      : status === "NOT_GENERATED"
        ? "Not Generated"
        : status ?? "—";

  const handleOpenPayment = (
    staff: StaffPayrollRow,
    method: "CASH" | "BANK" | "BKASH",
  ) => {
    setPaymentStaff(staff);
    setPaymentMethod(method);
    setPaymentDialogOpen(true);
  };

  const handleOpenAdvanceDialog = (staff: StaffPayrollRow) => {
    setSelectedStaff(staff);
    setAdvanceDialogOpen(true);
  };

  const handlePeriodChange = (field: "month" | "year", value: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set(field, value);
    router.push(`${pathname}?${newParams.toString()}`);
  };

  return (
    <>
      <div className="space-y-6 pb-4">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-col items-stretch gap-4 p-4 pb-4 sm:flex-row sm:items-center sm:justify-between sm:p-6 sm:pb-4">
            {/* Period controls — wraps on mobile */}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2.5">
              <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-border/70 bg-muted/40 px-3 py-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Payroll Period
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={String(selectedMonth)}
                  onValueChange={(value) => {
                    if (value) handlePeriodChange("month", value);
                  }}
                >
                  <SelectTrigger className="h-10 w-full rounded-xl border-border/70 bg-background px-3 text-sm shadow-none sm:w-40">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={String(selectedYear)}
                  onValueChange={(value) => {
                    if (value) handlePeriodChange("year", value);
                  }}
                >
                  <SelectTrigger className="h-10 w-full rounded-xl border-border/70 bg-background px-3 text-sm shadow-none sm:w-28">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {getYearOptions().map((y) => (
                      <SelectItem key={y.value} value={y.value}>
                        {y.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Sparkles className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground">
                  {currentFilters.search
                    ? "No payroll records match your search."
                    : "No payroll records found."}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  {currentFilters.search
                    ? "Try a different search term."
                    : "Try adjusting the filters or search term."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="h-10 w-16 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        SL No.
                      </TableHead>
                      <TableHead className="h-10 min-w-56 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          Name
                          <ArrowUpDown className="h-3 w-3" />
                        </span>
                      </TableHead>
                      <TableHead className="h-10 min-w-32 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Designation
                      </TableHead>
                      <TableHead className="h-10 min-w-40 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Department
                      </TableHead>
                      <TableHead className="h-10 min-w-32 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Net Salary
                      </TableHead>
                      <TableHead className="h-10 min-w-32 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Advance Salary
                      </TableHead>
                      <TableHead className="h-10 min-w-32 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Overtime (hr|tk)
                      </TableHead>
                      <TableHead className="h-10 min-w-32 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Payable Amount
                      </TableHead>
                      <TableHead className="h-10 min-w-28 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Status
                      </TableHead>
                      <TableHead className="h-10 min-w-44 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, index) => (
                      <TableRow
                        key={row.id}
                        className="group transition-colors hover:bg-muted/20"
                      >
                        <TableCell className="text-center text-xs text-muted-foreground">
                          {String(row.sl ?? index + 1).padStart(2, "0")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3 font-medium text-foreground">
                            <div className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                              {row.name
                                .split(" ")
                                .map((part: string) => part.charAt(0))
                                .slice(0, 2)
                                .join("")}
                            </div>
                            <span>{row.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {row.designation}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {row.department || "—"}
                        </TableCell>
                        <TableCell className="text-sm font-medium text-foreground/90">
                          {formatMoney(row.totalSalary)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600 ring-1 ring-amber-200">
                            <HandCoins className="h-3.5 w-3.5" />
                            {formatMoney(row.advanceSalary ?? 0)}
                            <AdvanceSalaryInvoiceIcon
                              staff={row}
                              hasAdvance={(row.advanceSalary ?? 0) > 0}
                            />
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {(row.overtimeHours ?? 0) > 0 && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-50 px-2.5 py-1 text-xs font-medium text-fuchsia-600 ring-1 ring-fuchsia-200 w-fit">
                                <Wallet className="h-3.5 w-3.5" />
                                {row.overtimeHours} hr
                              </span>
                            )}
                            {(row.overtimeAmount ?? 0) > 0 && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600 ring-1 ring-indigo-200 w-fit">
                                {formatMoney(row.overtimeAmount!)}
                              </span>
                            )}
                            {(row.overtimeHours ?? 0) === 0 &&
                              (row.overtimeAmount ?? 0) === 0 && (
                                <span className="text-xs text-muted-foreground">
                                  —
                                </span>
                              )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-blue-600">
                          {formatMoney(isPaid(row.status) ? 0 : (row.payableAmount ?? row.totalSalary))}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1",
                              isPaid(row.status)
                                ? "bg-emerald-50 text-emerald-600 ring-emerald-200"
                                : "bg-amber-50 text-amber-600 ring-amber-200",
                            )}
                          >
                            {statusLabel(row.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                disabled={isPaid(row.status)}
                                render={
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isPaid(row.status)}
                                    className={cn(
                                      "h-8 rounded-full px-3 text-xs",
                                      isPaid(row.status)
                                        ? "border-slate-200 bg-slate-100 text-slate-400 hover:bg-slate-100 hover:text-slate-400 cursor-not-allowed"
                                        : "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700",
                                    )}
                                    title={
                                      isPaid(row.status)
                                        ? `${row.name} has already been paid for this period.`
                                        : "Pay salary"
                                    }
                                    type="button"
                                  >
                                    <BadgeCheck className="h-3.5 w-3.5" />
                                    Paid
                                    <ChevronDown className="h-3 w-3 -mr-1 opacity-70" />
                                  </Button>
                                }
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                  onClick={() => handleOpenPayment(row, "CASH")}
                                  className="gap-2 text-sm"
                                >
                                  <Banknote className="h-4 w-4 text-emerald-600" />
                                  <span className="font-medium">CASH</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleOpenPayment(row, "BANK")
                                  }
                                  className="gap-2 text-sm"
                                >
                                  <Landmark className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium">Bank</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleOpenPayment(row, "BKASH")
                                  }
                                  className="gap-2 text-sm"
                                >
                                  <Smartphone className="h-4 w-4 text-rose-600" />
                                  <span className="font-medium">bKash</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn(
                                "h-8 rounded-full px-3 text-xs",
                                isPaid(row.status)
                                  ? "border-slate-200 bg-slate-100 px-3 text-slate-400 hover:bg-slate-100 hover:text-slate-400 cursor-not-allowed"
                                  : "border-violet-200 bg-violet-50 text-violet-600 hover:bg-violet-100 hover:text-violet-700",
                              )}
                              onClick={() => handleOpenAdvanceDialog(row)}
                              type="button"
                              disabled={isPaid(row.status)}
                              title={
                                isPaid(row.status)
                                  ? `${row.name} has already been paid for this period, so an advance cannot be recorded.`
                                  : "Record an advance salary"
                              }
                            >
                              <HandCoins className="h-3.5 w-3.5" />
                              Advance
                            </Button>
                            <ViewPayrollButton staff={row} onClick={() => handleDownloadReceipt(row, selectedMonth, selectedYear)} />
                            <Link
                              href={`/dashboard/payroll/staff-payroll/${row.id}`}
                            >
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="rounded-full text-emerald-600 opacity-80 transition hover:bg-emerald-50 hover:text-emerald-700 hover:opacity-100"
                                type="button"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>{" "}
                            </Link>
                          </div>
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

      <StaffAdvanceSalaryDialog
        open={advanceDialogOpen}
        onOpenChange={setAdvanceDialogOpen}
        staff={selectedStaff}
        onSuccess={() => router.refresh()}
      />

      <StaffPayrollPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        staff={paymentStaff}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        paymentMethod={paymentMethod}
      />
    </>
  );
};

export default StaffPayrollTable;
