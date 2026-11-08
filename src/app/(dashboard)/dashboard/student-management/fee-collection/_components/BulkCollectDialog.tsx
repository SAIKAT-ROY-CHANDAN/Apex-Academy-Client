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

export interface BulkDueRow {
  key: string;
  name: string;
  label: string;
  max: number;
  billed: boolean;
  collectionItemId?: string;
  feeItemId?: string;
  feeTypeId?: string;
  monthEnum?: string | null;
  year?: number | null;
  student_enrollment_id?: string | null;
  subject_fail_count?: number | null;
}

interface BulkCollectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  title: string;
  description: string;
  rows: BulkDueRow[];
  studentName?: string;
  className?: string;
  studentPhone?: string;
}

const BulkCollectDialog = ({
  open,
  onOpenChange,
  studentId,
  title,
  description,
  rows,
  studentName,
  className,
  studentPhone,
}: BulkCollectDialogProps) => {
  const router = useRouter();
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [discounts, setDiscounts] = useState<Record<string, string>>({});
  const [totalDiscount, setTotalDiscount] = useState<string>("");
  const [method, setMethod] = useState("CASH");
  const [note, setNote] = useState("");
  const [paymentDate, setPaymentDate] = useState(getTodayDateString());
  const [submitting, setSubmitting] = useState(false);

  const totalDue = useMemo(
    () => rows.reduce((sum, row) => sum + row.max, 0),
    [rows],
  );

  // Distribute total scholarship proportionally across rows
  const distributeDiscount = (total: number) => {
    if (total <= 0) {
      const cleared: Record<string, string> = {};
      const clearedAmounts: Record<string, string> = {};
      rows.forEach((row) => {
        cleared[row.key] = "";
        clearedAmounts[row.key] = row.max.toFixed(2);
      });
      setDiscounts(cleared);
      setAmounts(clearedAmounts);
      return;
    }
    const distributed: Record<string, string> = {};
    const adjustedAmounts: Record<string, string> = {};
    let remaining = total;
    rows.forEach((row, idx) => {
      const proportion = row.max / totalDue;
      let share = Math.min(Math.round(total * proportion * 100) / 100, row.max);
      if (idx === rows.length - 1) {
        share = Math.min(remaining, row.max);
      }
      remaining -= share;
      distributed[row.key] = share > 0 ? share.toFixed(2) : "";
      // Adjust pay amount to be (due - scholarship)
      const payAmount = Math.max(0, row.max - share);
      adjustedAmounts[row.key] = payAmount.toFixed(2);
    });
    setDiscounts(distributed);
    setAmounts(adjustedAmounts);
  };

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
      setTotalDiscount("");
      setMethod("CASH");
      setNote("");
      setPaymentDate(getTodayDateString());
    }
  }, [open, rows]);

  useEffect(() => {
    if (totalDiscount !== "") {
      const total = Number(totalDiscount) || 0;
      if (total >= 0) distributeDiscount(total);
    }
  }, [totalDiscount, rows, totalDue]);

  const remainingDue = useMemo(
    () =>
      rows.reduce((sum, row) => {
        const paid = Math.min(Number(amounts[row.key]) || 0, row.max);
        const disc = Math.min(Number(discounts[row.key] ?? "") || 0, row.max);
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

  const totalDiscountExceeds = rows.some((row) => {
    const disc = Number(discounts[row.key] ?? "") || 0;
    return disc > row.max;
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
      toast.error(
        "Enter at least one paid amount or scholarship greater than 0",
      );
      return;
    }

    setSubmitting(true);
    try {
      let collected = 0;
      let totalScholarship = 0;
      let failed = 0;
      const failureReasons: string[] = [];

      // 1. Billed items → record payment against each existing record
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
            totalScholarship += discountAmount;
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

      // 2. Unbilled expectations → create collection + payment per fee type
      const unbilledGroups = new Map<
        string,
        {
          feeItemId: string;
          monthEnum: string | null;
          year: number | null;
          key: string;
          max: number;
        }[]
      >();
      payableRows
        .filter((row) => !row.billed && row.feeTypeId && row.feeItemId)
        .forEach((row) => {
          const feeTypeId = row.feeTypeId as string;
          const group = unbilledGroups.get(feeTypeId) ?? [];
          group.push({
            feeItemId: row.feeItemId as string,
            monthEnum: row.monthEnum ?? null,
            year: row.year ?? null,
            key: row.key,
            max: row.max,
            student_enrollment_id: (row as any).student_enrollment_id ?? null,
          } as any);
          unbilledGroups.set(feeTypeId, group);
        });

      for (const [feeTypeId, group] of unbilledGroups) {
        try {
          const response = await studentFeeCollection({
            student_id: studentId,
            created_at: toCreatedAtISO(paymentDate),
            studentFeeCollection: {
              fee_type_id: feeTypeId,
              items: group.map((row: any) => ({
                fee_item_id: row.feeItemId,
                fee_month: row.monthEnum,
                fee_year: row.year,
                line_total_amount: row.max,
                discount_amount: Number(discounts[row.key] ?? "") || 0,
                paid_amount: Number(amounts[row.key]),
                payment_method: method,
                payment_note: note || null,
                ...(row.student_enrollment_id
                  ? { student_enrollment_id: row.student_enrollment_id }
                  : {}),
              })),
            },
          });
          console.log(response);

          if (response?.success) {
            collected += group.reduce(
              (sum, row) => sum + Number(amounts[row.key]),
              0,
            );
            totalScholarship += group.reduce(
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

      if (collected > 0 || totalScholarship > 0) {
        toast.success(
          `Collected ${formatAmount(collected)} across ${payableRows.length - failed} item(s)` +
            (totalScholarship > 0
              ? ` + Scholarship ${formatAmount(totalScholarship)}`
              : "") +
            (failed > 0 ? ` — ${failed} batch(es) failed` : ""),
        );

        // Auto-print combined invoice for the whole batch
        void printFeeCollectionReceipt({
          studentName: studentName ?? "Student",
          className,
          studentPhone,
          method,
          note: note || null,
          entries: payableRows.map((row) => ({
            name: row.name,
            period: row.label,
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
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-md border border-red-500/20 bg-red-500/[0.06] px-3 py-2 text-sm">
            <span className="text-muted-foreground">
              Total due ({rows.length} item{rows.length > 1 ? "s" : ""})
            </span>
            <span className="font-semibold tabular-nums text-red-600">
              {formatAmount(totalDue)}
            </span>
          </div>

          {/* Total Scholarship input */}
          <div className="flex items-center gap-3 rounded-md border border-blue-500/20 bg-blue-500/[0.06] px-3 py-2 text-sm">
            <Label className="text-xs font-medium text-blue-700 shrink-0">
              Total Scholarship
            </Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              max={totalDue}
              value={totalDiscount}
              onChange={(e) => setTotalDiscount(e.target.value)}
              placeholder="Enter total scholarship to distribute"
              className="w-48 h-8 text-sm"
            />
            <span className="text-xs text-muted-foreground">
              (Distributes proportionally; editable per row)
            </span>
          </div>

          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
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

              return (
                <div
                  key={row.key}
                  className="flex items-center gap-3 rounded-md border p-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{row.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.label}
                      {!row.billed && (
                        <span className="ml-1.5 inline-block rounded bg-amber-500/15 px-1 py-px text-[10px] font-semibold uppercase tracking-wide text-amber-600">
                          will be billed
                        </span>
                      )}
                    </p>
                    <p className="text-xs tabular-nums text-red-600">
                      Due: {formatAmount(row.max)}
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
              <Label htmlFor="bulk-note" className="text-xs">
                Note (optional)
              </Label>
              <Input
                id="bulk-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Payment note..."
                className="mt-1 h-8 text-sm"
              />
            </div>
          </div>

          <PaymentDateField
            id="bulk-payment-date"
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
                Processing...
              </>
            ) : (
              <>
                <Banknote className="mr-1.5 h-3.5 w-3.5" />
                Pay {formatAmount(totalDue)}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkCollectDialog;
