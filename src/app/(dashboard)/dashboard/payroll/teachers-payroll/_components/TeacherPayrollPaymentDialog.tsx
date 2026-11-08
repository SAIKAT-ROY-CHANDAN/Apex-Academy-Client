"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TeacherPayrollRow } from "@/types/modules/payroll";
import {
  Banknote,
  CheckCircle2,
  Landmark,
  Loader2,
  Smartphone,
  User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  calculateTeacherPayroll,
  createTeacherPayroll,
  type PreviewTeacherPayrollParams,
} from "@/services/payroll/teachers-payroll";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatTeacherType } from "@/constant/teacher/teacherType";

const currency = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

const formatMoney = (amount: number) => currency.format(amount);

export type PaymentMethod = "CASH" | "BANK" | "BKASH";

type CalculateResult = {
  teacher?: {
    full_name?: string;
    id?: string;
    teacher_type?: string;
    designation?: { name: string } | null;
    department?: {
      department_name?: string;
      name?: string;
    } | null;
    shift?: { name: string } | null;
  };

  netSalary?: number;
  overtimeHours?: number;
  overtimeAmount?: number;
  advanceSalary?: number;
  payableAmount?: number;

  [key: string]: unknown;
};

type TeacherPayrollPaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: TeacherPayrollRow | null;
  selectedMonth: number;
  selectedYear: number;
  paymentMethod: PaymentMethod | null;
};

const methodMeta: Record<
  Exclude<PaymentMethod, null>,
  {
    label: string;
    verb: string;
    buttonLabel: string;
    accent: string;
    accentMuted: string;
    iconBg: string;
    icon: typeof Banknote;
  }
> = {
  CASH: {
    label: "CASH",
    verb: "Pay in Cash",
    buttonLabel: "Confirm Cash Payment",
    accent: "text-emerald-700",
    accentMuted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconBg: "bg-emerald-100 text-emerald-700",
    icon: Banknote,
  },

  BANK: {
    label: "BANK",
    verb: "Pay via Bank",
    buttonLabel: "Confirm Bank Payment",
    accent: "text-blue-700",
    accentMuted: "bg-blue-50 text-blue-700 border-blue-200",
    iconBg: "bg-blue-100 text-blue-700",
    icon: Landmark,
  },

  BKASH: {
    label: "BKASH",
    verb: "Pay via bKash",
    buttonLabel: "Confirm bKash Payment",
    accent: "text-rose-700",
    accentMuted: "bg-rose-50 text-rose-700 border-rose-200",
    iconBg: "bg-rose-100 text-rose-700",
    icon: Smartphone,
  },
};

const TeacherPayrollPaymentDialog = ({
  open,
  onOpenChange,
  teacher,
  selectedMonth,
  selectedYear,
  paymentMethod,
}: TeacherPayrollPaymentDialogProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [payrollData, setPayrollData] =
    useState<CalculateResult | null>(null);
  const [paymentNote, setPaymentNote] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      if (!open || !teacher || !paymentMethod) return;

      setLoading(true);
      setPayrollData(null);

      try {
        const params: PreviewTeacherPayrollParams = {
          month: selectedMonth,
          year: selectedYear,
          teacherId: teacher.teacherId ?? teacher.id,
        };

        const result = (await calculateTeacherPayroll(
          params,
        )) as CalculateResult;

        if (cancelled) return;

        const unwrapped =
          result?.data && typeof result.data === "object"
            ? (result.data as CalculateResult)
            : result;

        setPayrollData(unwrapped);
      } catch (error) {
        console.error("Failed to calculate teacher payroll:", error);

        if (!cancelled) {
          toast.error(
            "Failed to load payroll details. Please try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [open, teacher, selectedMonth, selectedYear, paymentMethod]);

  const handleAction = async () => {
    if (!teacher || !paymentMethod) return;

    setSubmitting(true);

    try {
      const response = await createTeacherPayroll({
        month: selectedMonth,
        year: selectedYear,
        teacherId: teacher.teacherId ?? teacher.id,
        paymentMethod,
        paymentNote: paymentNote.trim() || undefined,
      });

      if (response?.success) {
        toast.success(
          response.message ||
            `${teacher.name} marked as paid.`,
        );

        onOpenChange(false);
        router.refresh();
        return;
      }

      toast.error(
        response?.message ||
          "Cash payment failed. Please try again.",
      );
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isBank = paymentMethod === "BANK";

  const meta = paymentMethod
    ? methodMeta[paymentMethod]
    : methodMeta.CASH;

  const MethodIcon = meta.icon;

  const displayName =
    payrollData?.teacher?.full_name ??
    teacher?.name ??
    "—";

  const displayDesignation =
    payrollData?.teacher?.designation?.name ??
    teacher?.designation ??
    "—";

  const displayDepartment =
    payrollData?.teacher?.department?.department_name ??
    payrollData?.teacher?.department?.name ??
    teacher?.department ??
    "—";

  const displayTeacherType = payrollData?.teacher?.teacher_type
    ? formatTeacherType(payrollData.teacher.teacher_type)
    : (teacher?.teacherType ?? "—");

  const netSalary =
    payrollData?.netSalary ??
    teacher?.totalSalary ??
    0;

  const overtimeHours =
    payrollData?.overtimeHours ??
    teacher?.overtimeHours ??
    0;

  const overtimeAmount =
    payrollData?.overtimeAmount ??
    teacher?.overtimeAmount ??
    0;

  const advanceSalary =
    payrollData?.advanceSalary ??
    teacher?.advanceSalary ??
    0;

  const payableAmount =
    payrollData?.payableAmount ??
    teacher?.payableAmount ??
    teacher?.totalSalary ??
    0;

  const initials = useMemo(
    () =>
      displayName
        .split(" ")
        .map((part) => part.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase(),
    [displayName],
  );

  const monthYearLabel = useMemo(
    () =>
      new Date(
        selectedYear,
        selectedMonth - 1,
        1,
      ).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    [selectedMonth, selectedYear],
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setPayrollData(null);
          setPaymentNote("");
        }

        onOpenChange(next);
      }}
    >
      <DialogContent
        className="
          flex
          w-[calc(100%-1rem)]
          max-h-[90dvh]
          flex-col
          overflow-hidden
          rounded-2xl
          p-0
          sm:max-w-md
        "
      >
        {/* Compact Header */}
        <div
          className={cn(
            "shrink-0 border-b px-4 py-3",
            meta.iconBg,
          )}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm ring-1 ring-black/5">
              <MethodIcon className="size-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <DialogTitle className="truncate text-sm font-semibold text-slate-900">
                  {meta.verb}
                </DialogTitle>

                <span
                  className={cn(
                    "shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                    meta.accentMuted,
                  )}
                >
                  {meta.label}
                </span>
              </div>

              <p className="mt-0.5 text-[11px] text-slate-600">
                {monthYearLabel}
              </p>
            </div>
          </div>

          {/* Teacher */}
          <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-black/5 bg-white/80 px-2.5 py-1.5 shadow-sm">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[10px] font-bold text-white">
              {initials || "—"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-900">
                {displayName}
              </p>

              <p className="truncate text-[10px] text-slate-500">
                {displayDesignation}
                {displayDepartment !== "—" && (
                  <>
                    <span className="mx-1 text-slate-300">
                      ·
                    </span>
                    {displayDepartment}
                  </>
                )}
              </p>
            </div>

            {displayTeacherType !== "—" && (
              <span className="hidden shrink-0 items-center gap-1 rounded-md bg-slate-100 px-1.5 py-1 text-[9px] font-medium text-slate-600 sm:inline-flex">
                <User className="size-2.5" />
                {displayTeacherType}
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10">
              <Loader2 className="size-7 animate-spin text-slate-400" />

              <p className="text-xs font-medium text-slate-500">
                Loading payroll details…
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* Payroll Summary */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="divide-y divide-slate-100 px-3">
                  <LineItem
                    label="Net Salary"
                    value={netSalary}
                  />

                  <LineItem
                    label={
                      overtimeHours > 0
                        ? `Overtime (${overtimeHours} hr${
                            overtimeHours === 1 ? "" : "s"
                          })`
                        : "Overtime"
                    }
                    value={overtimeAmount}
                    sign="+"
                    tone="positive"
                  />

                  <LineItem
                    label="Advance Deduction"
                    value={advanceSalary}
                    sign="−"
                    tone="negative"
                  />
                </div>

                {/* Payable */}
                <div
                  className={cn(
                    "flex items-center justify-between border-t px-3 py-2.5",
                    meta.accentMuted,
                  )}
                >
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider opacity-75">
                      Total Payable
                    </p>
                  </div>

                  <span
                    className={cn(
                      "text-lg font-bold tabular-nums",
                      meta.accent,
                    )}
                  >
                    {formatMoney(payableAmount)}
                  </span>
                </div>
              </div>

              {/* Minimal Details */}
              <div className="rounded-xl border border-slate-200 bg-white px-3">
                <DetailRow
                  label="Designation"
                  value={displayDesignation}
                />

                <DetailRow
                  label="Teacher Type"
                  value={displayTeacherType}
                />
              </div>

              {/* Payment Note */}
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                <label className="text-xs font-medium text-slate-500">
                  Payment Note <span className="text-slate-400">(optional)</span>
                </label>
                <textarea
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="Add a note for this payment..."
                  className="mt-1.5 h-16 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>
          )}
        </div>

        {/* Compact Footer */}
        <DialogFooter
          className="
            shrink-0
            grid
            grid-cols-2
            gap-2
            border-t
            border-slate-100
            bg-white
            px-4
            py-2.5
          "
          style={{
            paddingBottom:
              "max(0.625rem, env(safe-area-inset-bottom))",
          }}
        >
          <Button
            type="button"
            variant="outline"
            disabled={submitting || loading}
            className="h-10 rounded-lg border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={submitting || loading}
            className={cn(
              "h-10 rounded-lg text-xs font-semibold text-white shadow-sm",
              isBank
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-emerald-600 hover:bg-emerald-700",
            )}
            onClick={handleAction}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                Processing…
              </>
            ) : isBank ? (
              <>
                <Landmark className="mr-1.5 size-3.5" />
                Pay via Bank
              </>
            ) : paymentMethod === "BKASH" ? (
              <>
                <Smartphone className="mr-1.5 size-3.5" />
                Confirm bKash Payment
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-1.5 size-3.5" />
                Confirm Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ---------------------------------------------
 * Payroll Line Item
 * --------------------------------------------- */

function LineItem({
  label,
  value,
  sign,
  tone = "neutral",
}: {
  label: string;
  value: number;
  sign?: "+" | "−";
  tone?: "neutral" | "positive" | "negative";
}) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-700"
      : tone === "negative"
        ? "text-rose-700"
        : "text-slate-900";

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span
        className={cn(
          "text-xs font-semibold tabular-nums",
          toneClass,
        )}
      >
        {sign ? `${sign} ` : ""}
        {formatMoney(value)}
      </span>
    </div>
  );
}

/* ---------------------------------------------
 * Detail Row
 * --------------------------------------------- */

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 last:border-0">
      <span className="text-[10px] font-medium text-slate-400">
        {label}
      </span>

      <span className="max-w-[65%] truncate text-right text-xs font-medium text-slate-700">
        {value}
      </span>
    </div>
  );
}

export default TeacherPayrollPaymentDialog;
