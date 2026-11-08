"use client";

import { AlertTriangle, Banknote, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import PaymentDateField, {
  getTodayDateString,
  isInvalidCreatedAtMessage,
  toCreatedAtISO,
} from "@/components/shared/payment-date-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminDuePayment, studentFeeCollection } from "@/services/student";
import { printFeeCollectionReceipt } from "./feeCollectionInvoice";

const formatAmount = (amount: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(amount);

export interface BilledDueItem {
  collectionItemId: string;
  name: string;
  due: number;
}

export interface UnbilledDueItem {
  feeItemId: string;
  name: string;
  amount: number;
  feeTypeId: string;
  fee_assign_for?: "REGULAR" | "SUPPLEMENTARY";
  amount_every_subject?: number | null;
}

interface CollectMonthlyDueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  monthLabel: string;
  monthEnum: string;
  year: number;
  billedItems: BilledDueItem[];
  unbilledItems: UnbilledDueItem[];
  studentName?: string;
  className?: string;
  studentPhone?: string;
}

interface RowState {
  key: string;
  name: string;
  max: number;
  billed: boolean;
  collectionItemId?: string;
  feeItemId?: string;
  feeTypeId?: string;
  fee_assign_for?: "REGULAR" | "SUPPLEMENTARY";
  amount_every_subject?: number | null;
  academic_session?: {
    session_name: string;
  };
}

const CollectMonthlyDueDialog = ({
  open,
  onOpenChange,
  studentId,
  monthLabel,
  monthEnum,
  year,
  billedItems,
  unbilledItems,
  studentName,
  className,
  studentPhone,
}: CollectMonthlyDueDialogProps) => {
  const router = useRouter();
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [discounts, setDiscounts] = useState<Record<string, string>>({});
  const [method, setMethod] = useState("CASH");
  const [note, setNote] = useState("");
  const [paymentDate, setPaymentDate] = useState(getTodayDateString());
  const [submitting, setSubmitting] = useState(false);

  const rows = useMemo<RowState[]>(
    () => [
      ...billedItems.map((item) => ({
        key: `billed-${item.collectionItemId}`,
        name: item.name,
        max: item.due,
        billed: true,
        collectionItemId: item.collectionItemId,
      })),
      ...unbilledItems.map((item) => ({
        key: `unbilled-${item.feeItemId}`,
        name: item.name,
        max: item.amount,
        billed: false,
        feeItemId: item.feeItemId,
        feeTypeId: item.feeTypeId,
        fee_assign_for: item.fee_assign_for,
        amount_every_subject: item.amount_every_subject,
      })),
    ],
    [billedItems, unbilledItems],
  );

  const totalDue = useMemo(
    () => rows.reduce((sum, row) => sum + row.max, 0),
    [rows],
  );

  // Prefill each time the dialog is opened for a month
  useEffect(() => {
    if (open && rows.length > 0) {
      const initial: Record<string, string> = {};
      const initialDiscounts: Record<string, string> = {};
      rows.forEach((row) => {
        initial[row.key] = row.max.toFixed(2);
        initialDiscounts[row.key] = "";
      });
      setAmounts(initial);
      setDiscounts(initialDiscounts);
      setMethod("CASH");
      setNote("");
      setPaymentDate(getTodayDateString());
    }
  }, [open, rows]);

  const remainingDue = useMemo(
    () =>
      rows.reduce((sum, row) => {
        const paid = Math.min(Number(amounts[row.key]) || 0, row.max);
        const disc = Math.min(Number(discounts[row.key]) || 0, row.max);
        return sum + Math.max(0, row.max - paid - disc);
      }, 0),
    [rows, amounts, discounts],
  );

  const invalid = rows.some((row) => {
    const value = Number(amounts[row.key]);
    const disc = Number(discounts[row.key] ?? "") || 0;
    if (!Number.isFinite(value) || value < 0) return true;
    if (!Number.isFinite(disc) || disc < 0) return true;
    return value + disc > row.max;
  });

  if (!open || rows.length === 0) return null;

  const handleSubmit = async () => {
    if (invalid) {
      toast.error("Each amount must be between 0 and its due/fee amount");
      return;
    }

    const payableRows = rows.filter(
      (row) =>
        (Number(amounts[row.key]) || 0) > 0 ||
        (Number(discounts[row.key] ?? "") || 0) > 0,
    );

    if (payableRows.length === 0) {
      toast.error("Enter at least one paid amount or discount greater than 0");
      return;
    }

    setSubmitting(true);
    try {
      let collected = 0;
      let failed = 0;
      let totalDiscount = 0;
      const failureReasons: string[] = [];

      // 1. Billed items → record payment against each existing collection item
      for (const row of payableRows.filter((r) => r.billed)) {
        try {
          const paidAmount = Number(amounts[row.key]);
          const discountAmount = Number(discounts[row.key] ?? "") || 0;
          const response = await adminDuePayment(studentId, {
            student_fee_collection_item_id: row.collectionItemId,
            paid_amount: paidAmount,
            discount_amount: discountAmount,
            payment_method: method,
            payment_note: note || null,
            created_at: toCreatedAtISO(paymentDate),
          });
          if (response?.success) {
            collected += paidAmount;
            totalDiscount += discountAmount;
          } else {
            failed += 1;
            if (response?.message) failureReasons.push(response.message);
          }
        } catch (error) {
          failed += 1;
          failureReasons.push(
            error instanceof Error ? error.message : "Payment request failed",
          );
        }
      }

      // 2. Unbilled items → create collection + payment in one call,
      //    grouped by fee type
      const unbilledGroups = new Map<
        string,
        { feeItemId: string; name: string; key: string; max: number }[]
      >();
      payableRows
        .filter((row) => !row.billed && row.feeTypeId && row.feeItemId)
        .forEach((row) => {
          const feeTypeId = row.feeTypeId as string;
          const group = unbilledGroups.get(feeTypeId) ?? [];
          group.push({
            feeItemId: row.feeItemId as string,
            name: row.name,
            key: row.key,
            max: row.max,
          });
          unbilledGroups.set(feeTypeId, group);
        });

      for (const [feeTypeId, group] of unbilledGroups) {
        try {
          const response = await studentFeeCollection({
            student_id: studentId,
            created_at: toCreatedAtISO(paymentDate),
            studentFeeCollection: {
              fee_type_id: feeTypeId,
              items: group.map((row) => ({
                fee_item_id: row.feeItemId,
                fee_month: monthEnum,
                fee_year: year,
                line_total_amount: row.max,
                discount_amount: Number(discounts[row.key] ?? "") || 0,
                paid_amount: Number(amounts[row.key]),
                payment_method: method,
                payment_note: note || null,
              })),
            },
          });
          if (response?.success) {
            collected += group.reduce(
              (sum, row) => sum + Number(amounts[row.key]),
              0,
            );
            totalDiscount += group.reduce(
              (sum, row) => sum + (Number(discounts[row.key] ?? "") || 0),
              0,
            );
          } else {
            failed += 1;
            if (response?.message) failureReasons.push(response.message);
          }
        } catch (error) {
          failed += 1;
          failureReasons.push(
            error instanceof Error ? error.message : "Fee collection failed",
          );
        }
      }

      if (collected > 0 || totalDiscount > 0) {
        toast.success(
          `Collected ${formatAmount(collected)} for ${monthLabel}` +
            (totalDiscount > 0
              ? ` + Scholarship ${formatAmount(totalDiscount)}`
              : "") +
            (failed > 0 ? ` — ${failed} payment(s) failed` : ""),
        );

        // Auto-print combined invoice for this batch
        void printFeeCollectionReceipt({
          studentName: studentName ?? "Student",
          className,
          studentPhone,
          method,
          note: note || null,
          entries: payableRows.map((row) => ({
            name: row.name,
            period: monthLabel,
            amount: row.max,
            paid: Number(amounts[row.key]),
            discount: Number(discounts[row.key] ?? "") || 0,
          })),
        });

        if (failed === 0) {
          onOpenChange(false);
        }
        router.refresh();
      } else {
        const firstReason = failureReasons[0] ?? "";
        toast.error(
          isInvalidCreatedAtMessage(firstReason)
            ? "Please select a valid payment date."
            : `All payments failed${failureReasons.length ? `: ${failureReasons[0]}` : ""}`,
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Collect Due — {monthLabel}</DialogTitle>
          <DialogDescription>
            Record payment against this month&apos;s outstanding fee items.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-md border border-red-500/20 bg-red-500/[0.06] px-3 py-2 text-sm">
            <span className="text-muted-foreground">Total due</span>
            <span className="font-semibold tabular-nums text-red-600">
              {formatAmount(totalDue)}
            </span>
          </div>

          <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
            {rows.map((row) => {
              const raw = amounts[row.key] ?? "";
              const discRaw = discounts[row.key] ?? "";
              const value = Number(raw);
              const discValue = Number(discRaw) || 0;
              const over =
                Number.isFinite(value) &&
                raw !== "" &&
                (value < 0 || value > row.max);
              const discOver =
                Number.isFinite(discValue) &&
                discRaw !== "" &&
                (discValue < 0 || discValue > row.max);
              const sumOver =
                Number.isFinite(value) &&
                Number.isFinite(discValue) &&
                raw !== "" &&
                discRaw !== "" &&
                value + discValue > row.max;

              // Supplementary fee breakdown display
              const isSupplementary = row.fee_assign_for === "SUPPLEMENTARY";
              const perSubject = row.amount_every_subject ?? 0;
              const suppLabel =
                isSupplementary && perSubject > 0
                  ? `${perSubject} × ${row.max / perSubject} = ${formatAmount(row.max)}`
                  : null;

              return (
                <div
                  key={row.key}
                  className="flex items-center gap-3 rounded-md border p-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{row.name}</p>
                    <p className="text-xs tabular-nums text-red-600">
                      Due: {formatAmount(row.max)}
                      <span className="ml-2 text-xs text-amber-600 font-medium">
                        ({row.academic_session?.session_name ?? "N/A"})
                      </span>
                      {!row.billed && (
                        <span className="ml-1.5 inline-block rounded bg-amber-500/15 px-1 py-px text-[10px] font-semibold uppercase tracking-wide text-amber-600">
                          will be billed
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-end gap-2">
                    <div className="w-24">
                      <Label className="text-[10px] text-muted-foreground block mb-0.5">
                        Pay
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        max={row.max}
                        value={raw}
                        aria-invalid={over || sumOver}
                        onChange={(e) =>
                          setAmounts((prev) => ({
                            ...prev,
                            [row.key]: e.target.value,
                          }))
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="w-24">
                      <Label className="text-[10px] text-muted-foreground block mb-0.5">
                        Scholarship
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        max={row.max}
                        value={discRaw}
                        aria-invalid={discOver || sumOver}
                        onChange={(e) =>
                          setDiscounts((prev) => ({
                            ...prev,
                            [row.key]: e.target.value,
                          }))
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  {(over || discOver || sumOver) && (
                    <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-destructive">
                      <AlertTriangle className="h-3 w-3" />
                      {sumOver
                        ? "Pay + Scholarship exceeds due"
                        : over
                          ? `Max ${formatAmount(row.max)}`
                          : `Max ${formatAmount(row.max)}`}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Payment Method</Label>
              <Select value={method} onValueChange={(v) => v && setMethod(v)}>
                <SelectTrigger className="mt-1 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="BANK">Bank</SelectItem>
                  <SelectItem value="BKASH">bKash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="monthly-note" className="text-xs">
                Note (optional)
              </Label>
              <Input
                id="monthly-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Payment note..."
                className="mt-1 h-8 text-sm"
              />
            </div>
          </div>

          <PaymentDateField
            id="monthly-payment-date"
            value={paymentDate}
            onChange={setPaymentDate}
          />

          <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-xs">
            <span className="text-muted-foreground">
              Remaining due after this
            </span>
            <span
              className={`font-semibold tabular-nums ${
                remainingDue > 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              {formatAmount(remainingDue)}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={submitting || invalid}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Banknote className="mr-1.5 h-3.5 w-3.5" />
                Collect
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CollectMonthlyDueDialog;
