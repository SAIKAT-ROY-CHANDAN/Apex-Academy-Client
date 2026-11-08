"use client";

import { AlertTriangle, Banknote, Loader2, Smartphone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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
import { initiateStudentBkashPayment } from "@/services/student";

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
}

interface StudentBulkCollectDialogProps {
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

const StudentBulkCollectDialog = ({
  open,
  onOpenChange,
  title,
  description,
  rows,
}: StudentBulkCollectDialogProps) => {
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const totalDue = useMemo(
    () => rows.reduce((sum, row) => sum + row.max, 0),
    [rows],
  );

  useEffect(() => {
    if (open && rows.length > 0) {
      const initial: Record<string, string> = {};
      rows.forEach((row) => {
        initial[row.key] = row.max.toFixed(2);
      });
      setAmounts(initial);
    }
  }, [open, rows]);

  const remainingDue = useMemo(
    () =>
      rows.reduce((sum, row) => {
        const paid = Math.min(Number(amounts[row.key]) || 0, row.max);
        return sum + (row.max - paid);
      }, 0),
    [rows, amounts],
  );

  const invalid = rows.some((row) => {
    const value = Number(amounts[row.key]);
    return !Number.isFinite(value) || value < 0 || value > row.max;
  });

  if (!open || rows.length === 0) return null;

  const handleSubmit = async () => {
    if (invalid) {
      toast.error("Each amount must be between 0 and its due/fee amount");
      return;
    }

    const payableRows = rows.filter(
      (row) => (Number(amounts[row.key]) || 0) > 0,
    );

    if (payableRows.length === 0) {
      toast.error("Enter at least one amount greater than 0");
      return;
    }

    setSubmitting(true);
    try {
      const response = await initiateStudentBkashPayment();
      if (response?.success && response?.data?.bkashURL) {
        window.location.href = response.data.bkashURL;
      } else {
        toast.error(response?.message ?? "Failed to initiate bKash payment");
        setSubmitting(false);
      }
      return;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-slate-200/80 shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle
            className="text-xl font-bold tracking-tight text-slate-900"
            style={{ fontFamily: "ui-serif, Georgia, serif" }}
          >
            {title}
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-sm">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50/50 px-4 py-3 text-sm">
            <span className="font-medium text-slate-600">
              Total due ({rows.length} item{rows.length > 1 ? "s" : ""})
            </span>
            <span className="font-bold tabular-nums text-rose-600 text-base">
              {formatAmount(totalDue)}
            </span>
          </div>

          <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
            {rows.map((row) => {
              const raw = amounts[row.key] ?? "";
              const value = Number(raw);
              const over =
                Number.isFinite(value) &&
                raw !== "" &&
                (value < 0 || value > row.max);

              return (
                <div
                  key={row.key}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/30 p-3 transition-colors hover:bg-slate-50/60"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {row.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {row.label}
                      {!row.billed && (
                        <span className="ml-1.5 inline-block rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 border border-amber-100">
                          unbilled
                        </span>
                      )}
                    </p>
                    <p className="text-xs font-semibold tabular-nums text-rose-600 mt-1">
                      Due: {formatAmount(row.max)}
                    </p>
                  </div>
                  <div className="w-28 shrink-0">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      max={row.max}
                      value={raw}
                      aria-invalid={over}
                      onChange={(e) =>
                        setAmounts((prev) => ({
                          ...prev,
                          [row.key]: e.target.value,
                        }))
                      }
                      className="h-8 text-sm rounded-lg border-slate-200 focus-visible:ring-slate-900"
                    />
                    {over && (
                      <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-destructive">
                        <AlertTriangle className="h-3 w-3" />
                        Max {formatAmount(row.max)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-100/50 px-4 py-2.5 text-xs">
            <span className="text-slate-500 font-medium">
              Remaining due after this
            </span>
            <span
              className={`font-bold tabular-nums ${
                remainingDue > 0 ? "text-rose-600" : "text-emerald-600"
              }`}
            >
              {formatAmount(remainingDue)}
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-pink-100 bg-pink-50/60 px-4 py-3">
            <Smartphone className="h-5 w-5 text-pink-600" />
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Pay securely with bKash
              </p>
              <p className="text-xs text-slate-500">
                Student portal payments are accepted through bKash only.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2 border-t border-slate-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="rounded-lg text-slate-500 hover:text-slate-800"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={submitting || invalid}
            className="rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
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

export default StudentBulkCollectDialog;
