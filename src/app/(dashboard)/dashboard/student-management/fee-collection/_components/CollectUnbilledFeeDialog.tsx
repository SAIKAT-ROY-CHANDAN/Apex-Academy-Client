"use client";

import { Banknote, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { studentFeeCollection } from "@/services/student";
import { printFeeCollectionReceipt } from "./feeCollectionInvoice";
import type { TUnbilledOneTimeFee } from "./types";

const formatAmount = (amount: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(amount);

interface CollectUnbilledFeeDialogProps {
  fee: TUnbilledOneTimeFee | null;
  studentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName?: string;
  className?: string;
  studentPhone?: string;
}

const CollectUnbilledFeeDialog = ({
  fee,
  studentId,
  open,
  onOpenChange,
  studentName,
  className,
  studentPhone,
}: CollectUnbilledFeeDialogProps) => {
  const router = useRouter();
  const [discount, setDiscount] = useState("0");
  const [paidAmount, setPaidAmount] = useState("");
  const [method, setMethod] = useState("CASH");
  const [note, setNote] = useState("");
  const [paymentDate, setPaymentDate] = useState(getTodayDateString());
  const [submitting, setSubmitting] = useState(false);

  // Prefill each time a new fee is opened
  useEffect(() => {
    if (open && fee) {
      setDiscount("0");
      setPaidAmount(fee.amount.toFixed(2));
      setMethod("CASH");
      setNote("");
      setPaymentDate(getTodayDateString());
    }
  }, [open, fee]);

  if (!fee) return null;

  const discountNum = Number(discount) || 0;
  const paidNum = Number(paidAmount) || 0;
  const remainingDue = Math.max(0, fee.amount - discountNum - paidNum);
  const invalid =
    discountNum < 0 || paidNum < 0 || discountNum + paidNum > fee.amount;

  const handleSubmit = async () => {
    if (invalid) {
      toast.error("Scholarship + paid cannot exceed the fee amount");
      return;
    }
    setSubmitting(true);
    try {
      const isSuppSubmit = fee.fee_assign_for === "SUPPLEMENTARY";
      const sourceEnrollmentId = (fee as any).source_enrollment_id as
        | string
        | undefined;
      const response = await studentFeeCollection({
        student_id: studentId,
        created_at: toCreatedAtISO(paymentDate),
        studentFeeCollection: {
          fee_type_id: fee.fee_type_id,
          items: [
            {
              fee_item_id: fee.id,
              fee_month: null,
              fee_year: null,
              line_total_amount: fee.amount,
              discount_amount: discountNum,
              paid_amount: paidNum,
              payment_method: method,
              payment_note: note || null,
              ...(isSuppSubmit && sourceEnrollmentId
                ? { student_enrollment_id: sourceEnrollmentId }
                : {}),
            },
          ],
        },
      });

      if (!response?.success) {
        toast.error(
          isInvalidCreatedAtMessage(response?.message)
            ? "Please select a valid payment date."
            : (response?.message ?? "Failed to collect fee"),
        );
        return;
      }

      toast.success(
        remainingDue > 0
          ? `Fee billed — ${formatAmount(remainingDue)} still due`
          : "Fee collected successfully",
      );

      // Auto-print invoice for this payment
      void printFeeCollectionReceipt({
        studentName: studentName ?? "Student",
        className,
        studentPhone,
        method,
        note: note || null,
        entries: [
          {
            name: fee.name,
            period: "One-time",
            amount: fee.amount,
            paid: paidNum,
          },
        ],
      });

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to collect fee",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isSupplementary = fee.fee_assign_for === "SUPPLEMENTARY";
  const supplementaryDetail = isSupplementary
    ? (() => {
        const count =
          (fee as any).subject_fail_count ?? fee.subject_fail_count ?? 1;
        const perSubject = (fee as any).amount_every_subject ?? 0;
        const className =
          (fee as any).supplementary_class_name ??
          (fee as any).academic_class?.class_name ??
          null;
        const sourceId = (fee as any).source_enrollment_id as
          | string
          | undefined;
        // Derive Attempt # chronologically if student context not available - fallback to source order
        return { count, perSubject, className, sourceId };
      })()
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Collect Fee</DialogTitle>
          <DialogDescription>
            Bill and collect payment for{" "}
            <span className="font-medium text-foreground">{fee.name}</span>
            {fee.fee_type_name ? (
              <>
                {" "}
                under{" "}
                <span className="font-medium text-foreground">
                  {fee.fee_type_name}
                </span>
              </>
            ) : null}
            {isSupplementary && supplementaryDetail?.className ? (
              <span className="text-muted-foreground">
                {" "}
                • {supplementaryDetail.className}
              </span>
            ) : null}
            .
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isSupplementary && supplementaryDetail && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                Supplementary Exam Fee
              </p>
              <p className="mt-1 text-sm text-amber-900">
                <span className="font-bold">{supplementaryDetail.count}</span>{" "}
                subject
                {supplementaryDetail.count > 1 ? "s" : ""} failed
                {supplementaryDetail.perSubject > 0 ? (
                  <span className="text-muted-foreground">
                    {" "}
                    • {formatAmount(supplementaryDetail.perSubject)} ×{" "}
                    {supplementaryDetail.count} ={" "}
                    {formatAmount(
                      supplementaryDetail.perSubject *
                        supplementaryDetail.count,
                    )}
                  </span>
                ) : null}
              </p>
              {supplementaryDetail.className && (
                <p className="text-xs text-amber-700">
                  Class: {supplementaryDetail.className}
                </p>
              )}
              <p className="mt-1 text-[11px] text-amber-700">
                This payment will be attributed to this specific attempt only.
              </p>
            </div>
          )}
          <div className="flex items-center justify-between rounded-md border border-red-500/20 bg-red-500/[0.06] px-3 py-2 text-sm">
            <span className="text-muted-foreground">Fee amount</span>
            <span className="font-semibold tabular-nums text-red-600">
              {formatAmount(fee.amount)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="unbilled-discount" className="text-xs">
                Scholarship
              </Label>
              <Input
                id="unbilled-discount"
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => {
                  const nextDiscount = Math.max(0, Number(e.target.value) || 0);
                  setDiscount(e.target.value);
                  // Keep paid within the remaining allowance so the
                  // discount + paid ≤ amount invariant always holds
                  const maxPaid = fee.amount - nextDiscount;
                  if (paidNum > maxPaid) {
                    setPaidAmount(Math.max(0, maxPaid).toFixed(2));
                  }
                }}
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="unbilled-paid" className="text-xs">
                Paid now (max {formatAmount(fee.amount - discountNum)})
              </Label>
              <Input
                id="unbilled-paid"
                type="number"
                min="0"
                step="0.01"
                max={fee.amount - discountNum}
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="mt-1 h-8 text-sm"
              />
            </div>
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
              <Label htmlFor="unbilled-note" className="text-xs">
                Note (optional)
              </Label>
              <Input
                id="unbilled-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Payment note..."
                className="mt-1 h-8 text-sm"
              />
            </div>
          </div>

          <PaymentDateField
            id="unbilled-payment-date"
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
                {remainingDue > 0 ? "Bill & Collect" : "Collect"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CollectUnbilledFeeDialog;
