"use client";

import { Plus, ReceiptText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createFeeItem } from "@/services/feeItem";
import FeeItemForm from "./FeeItemForm";
import type { FeeItemFormValues } from "./schema/fee-item.schema";
import type { FeeItem } from "./types/fee-item";
import type { FeeType } from "../../manage-fee/_components/types/fee-type";

interface AddFeeItemDialogProps {
  feeTypes?: FeeType[]; // kept optional for backward compat; form now cascades via Program→Department→FeeType
  onFeeItemCreated?: (newFeeItem: FeeItem) => void;
}

const FeeItemDialog = ({
  feeTypes: _feeTypes,
  onFeeItemCreated,
}: AddFeeItemDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: FeeItemFormValues) => {
    try {
      setIsSubmitting(true);
      const isOneTime = values.FeeItemType === "OneTime";
      const isSupplementary = values.fee_assign_for === "SUPPLEMENTARY";
      const payload = {
        fee_type_id: values.fee_type_id,
        name: values.name,
        FeeItemType: values.FeeItemType,
        fee_assign_for: values.fee_assign_for,
        amount: isSupplementary ? 0 : values.amount,
        amount_every_subject: isSupplementary ? values.amount_every_subject : undefined,
        isFine: values.isFine,
        feeStartMonth: isOneTime ? null : values.feeStartMonth ?? null,
        feeEndMonth: isOneTime ? null : values.feeEndMonth ?? null,
        payment_start_date: values.payment_start_date ?? null,
        // Only send fine-specific fields when isFine is true.
        // Backend forcibly sets them to null when isFine is false.
        ...(values.isFine
          ? {
            last_payment_date: values.last_payment_date ?? null,
            everydayFine_amount: values.everydayFine_amount ?? null,
          }
          : {}),
      };
      const newFeeItem = await createFeeItem(payload);

      if (newFeeItem?.success) {
        toast.success("Fee item created successfully");
        onFeeItemCreated?.(newFeeItem.data);
        setOpen(false);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create fee item",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-full inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <Plus className="h-4 w-4" />
        Add fee item
      </DialogTrigger>
      <DialogContent className="flex h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-h-[min(92dvh,900px)] max-w-3xl flex-col gap-0 overflow-hidden rounded-xl border-border/70 p-0 shadow-2xl sm:h-auto sm:rounded-2xl">
        <DialogHeader className="shrink-0 border-b bg-muted/20 px-4 py-4 pr-12 sm:px-6 sm:py-5 sm:pr-14">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ReceiptText className="size-5" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-lg font-semibold tracking-tight sm:text-xl">
                Add new fee item
              </DialogTitle>
              <DialogDescription className="max-w-xl text-xs leading-relaxed sm:text-sm">
                Define the fee scope, billing cycle, amount, and optional Late Fee rules.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-6 sm:py-6">
          <FeeItemForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeeItemDialog;
