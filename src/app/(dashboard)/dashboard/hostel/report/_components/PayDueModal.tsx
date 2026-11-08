"use client";

import { Banknote, Landmark, Loader2, Smartphone } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { HostelStudentsDueReportRow } from "@/services/hostel-report/hostel-report";
import { payHostelStudentDue } from "@/services/hostelFeeCollection";
import { printHostelInvoiceFromRecord } from "../../deposited/_components/hostel-invoice-print";

type PaymentMethod = "CASH" | "BKASH" | "BANK";

type PayDueModalProps = {
  row: HostelStudentsDueReportRow | null;
  totalDue: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaid: () => void;
};

const currency = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 2,
});

const formatMoney = (amount: number) => currency.format(amount);

const METHOD_OPTIONS: {
  value: PaymentMethod;
  label: string;
  icon: typeof Banknote;
}[] = [
  { value: "CASH", label: "Cash", icon: Banknote },
  { value: "BANK", label: "Bank", icon: Landmark },
  { value: "BKASH", label: "bKash", icon: Smartphone },
];

const PayDueModal = ({
  row,
  totalDue,
  open,
  onOpenChange,
  onPaid,
}: PayDueModalProps) => {
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const parsedAmount = Number(amount) || 0;
  const remainingAfter = useMemo(
    () => Math.max(0, Math.round((totalDue - parsedAmount) * 100) / 100),
    [totalDue, parsedAmount],
  );

  const resetForm = () => {
    setMethod("CASH");
    setAmount("");
    setNote("");
    setError("");
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const handlePayClick = () => {
    if (parsedAmount <= 0) {
      setError("Enter an amount greater than 0");
      return;
    }
    if (parsedAmount > totalDue) {
      setError(
        `Amount cannot exceed the total due of ${formatMoney(totalDue)}`,
      );
      return;
    }
    setError("");
    setConfirmOpen(true);
  };

  const handleConfirmPay = async () => {
    if (!row) return;
    setIsPaying(true);
    try {
      const res = await payHostelStudentDue({
        student_id: row.id,
        paid_amount: parsedAmount,
        payment_method: method,
        payment_note: note.trim() || undefined,
      });

      if (!res?.success) {
        toast.error(res?.message ?? "Failed to record due payment");
        setConfirmOpen(false);
        return;
      }

      toast.success(
        `${formatMoney(parsedAmount)} due payment recorded for ${row.name}`,
      );
      setConfirmOpen(false);
      resetForm();
      onOpenChange(false);
      if (res.data) {
        printHostelInvoiceFromRecord(res.data);
      }
      onPaid();
    } catch (err) {
      console.error("Failed to pay hostel due:", err);
      toast.error("Failed to record due payment");
      setConfirmOpen(false);
    } finally {
      setIsPaying(false);
    }
  };

  const methodLabel =
    method === "BKASH" ? "bKash" : method === "BANK" ? "Bank" : "Cash";

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pay Due</DialogTitle>
            <DialogDescription>
              Record a due payment for this student.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-1">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800/40 dark:bg-red-950/20">
              <div className="text-sm font-semibold text-red-900 dark:text-red-100">
                {row?.name}
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-red-700 dark:text-red-300">
                  Total Due
                </span>
                <span className="text-lg font-bold text-red-600">
                  {formatMoney(totalDue)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Payment Method</Label>
              <div className="grid grid-cols-3 gap-3">
                {METHOD_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const selected = method === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setMethod(opt.value)}
                      className={cn(
                        "flex h-11 items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors",
                        selected
                          ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-950/40 dark:text-blue-300"
                          : "border-border bg-white text-muted-foreground hover:border-blue-300 hover:text-foreground dark:bg-slate-900",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="pay-due-amount" className="text-sm font-medium">
                  Paying Amount
                </Label>
                <button
                  type="button"
                  onClick={() => setAmount(String(totalDue))}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Pay Full ({formatMoney(totalDue)})
                </button>
              </div>
              <Input
                id="pay-due-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 500"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError("");
                }}
                className="h-11"
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
              {parsedAmount > 0 && !error && (
                <p className="text-xs text-muted-foreground">
                  Remaining due after this payment:{" "}
                  <span className="font-semibold text-amber-600">
                    {formatMoney(remainingAfter)}
                  </span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pay-due-note" className="text-sm font-medium">
                Note <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="pay-due-note"
                placeholder="Optional note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="h-20 resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handlePayClick}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Pay Due
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm Due Payment"
        description={
          row
            ? `${formatMoney(parsedAmount)} of ${row.name}'s due will be paid via ${methodLabel}. Remaining due will be ${formatMoney(remainingAfter)}. An invoice will be generated for this transaction.`
            : ""
        }
        confirmLabel="Confirm Payment"
        cancelLabel="Cancel"
        isPending={isPaying}
        onConfirm={handleConfirmPay}
      />
    </>
  );
};

export default PayDueModal;
