"use client";

import { Loader2, ReceiptText } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getHostelFeeCollectionById } from "@/services/hostelFeeCollection";
import {
  formatAmount,
  formatDate,
  type HostelFeeCollectionRecord,
  type InvoiceStatus,
} from "./deposited.utils";

interface DepositDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionId: string | null;
  studentName: string;
}

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  PAID: "bg-emerald-50 text-emerald-600 border-emerald-200",
  PARTIAL: "bg-amber-50 text-amber-600 border-amber-200",
  UNPAID: "bg-red-50 text-red-500 border-red-200",
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-700 text-right">
        {value}
      </span>
    </div>
  );
}

export default function DepositDetailDialog({
  open,
  onOpenChange,
  collectionId,
  studentName,
}: DepositDetailDialogProps) {
  const [record, setRecord] = useState<HostelFeeCollectionRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !collectionId) return;
    let cancelled = false;
    setLoading(true);
    setRecord(null);
    getHostelFeeCollectionById(collectionId)
      .then((res) => {
        if (cancelled) return;
        if (res?.success && res.data) {
          setRecord(res.data as HostelFeeCollectionRecord);
        }
      })
      .catch((err) => console.error("Failed to load deposit details:", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, collectionId]);

  const invoice = record?.hostelInvoice ?? null;
  const items = record?.hostelFeeCollectionItems ?? [];
  const meal = record?.mealCollection ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Deposit History</DialogTitle>
          <DialogDescription>{studentName}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
            Loading details...
          </div>
        ) : !record ? (
          <div className="py-12 text-center text-sm text-slate-400">
            Failed to load deposit details.
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {invoice ? (
              <div className="rounded-xl border border-slate-200 p-4 space-y-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ReceiptText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-slate-700">
                      {invoice.invoice_no}
                    </span>
                  </div>
                  {invoice.status && (
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[invoice.status]}`}
                    >
                      {invoice.status}
                    </span>
                  )}
                </div>
                <div className="divide-y divide-slate-50">
                  <InfoRow
                    label="Generated on"
                    value={formatDate(invoice.issue_date)}
                  />
                  <InfoRow
                    label="Due date"
                    value={formatDate(invoice.due_date)}
                  />
                  <InfoRow
                    label="Due at generation"
                    value={formatAmount(invoice.due_amount ?? 0)}
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-4 text-xs text-slate-400 text-center">
                No invoice snapshot found for this record.
              </div>
            )}

            <div className="rounded-xl border border-slate-200 p-4">
              <h4 className="text-xs font-semibold tracking-wide text-slate-500 mb-2">
                AMOUNTS
              </h4>
              <div className="divide-y divide-slate-50">
                <InfoRow
                  label="Collected on"
                  value={formatDate(record.collection_date)}
                />
                {record.payment_method && (
                  <InfoRow
                    label="Payment Method"
                    value={record.payment_method === "BKASH" ? "bKash" : "Cash"}
                  />
                )}
                <InfoRow
                  label="Total amount"
                  value={formatAmount(record.total_amount ?? 0)}
                />
                <InfoRow
                  label="Scholarship"
                  value={formatAmount(record.scholarship_amount ?? 0)}
                />
                <InfoRow
                  label="Paid amount"
                  value={formatAmount(record.paid_amount ?? 0)}
                />
              </div>
            </div>

            {items.length > 0 && (
              <div className="rounded-xl border border-slate-200 p-4">
                <h4 className="text-xs font-semibold tracking-wide text-slate-500 mb-2">
                  FEE ITEMS
                </h4>
                <ul className="space-y-1.5">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-4 text-sm"
                    >
                      <span className="text-slate-600">{item.item_name}</span>
                      <span className="font-medium text-slate-700">
                        {formatAmount(item.item_amount ?? 0)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {meal && (
              <div className="rounded-xl border border-slate-200 p-4">
                <h4 className="text-xs font-semibold tracking-wide text-slate-500 mb-2">
                  MEAL CHARGES
                </h4>
                <div className="divide-y divide-slate-50">
                  <InfoRow label="Meals" value={String(meal.meal_count)} />
                  <InfoRow
                    label="Rate per meal"
                    value={formatAmount(meal.meal_rate ?? 0)}
                  />
                  <InfoRow
                    label="Meal total"
                    value={formatAmount(meal.total_amount ?? 0)}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
