"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTransition } from "react";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormInput } from "@/components/form/form-input";
import { FormSelect } from "@/components/form/form-select";
import { StaffPayrollRow } from "@/types/modules/payroll";
import { CalendarDays } from "lucide-react";
import { useEffect } from "react";
import {
  advanceSalarySchema,
} from "@/validation/payroll/teacher-payroll";

type AdvanceSalaryFormValues = z.infer<typeof advanceSalarySchema>;

type AdvanceSalaryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffPayrollRow | null;
  onSuccess?: () => void;
};

const PAYMENT_OPTIONS = [
  { label: "Cash", value: "CASH" },
  { label: "Bank", value: "BANK" },
  { label: "bKash", value: "BKASH" },
];

const generateTransactionId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BK-${timestamp}-${random}`;
};

const AdvanceSalaryDialog = ({
  open,
  onOpenChange,
  staff,
  onSuccess,
}: AdvanceSalaryDialogProps) => {
  const [isPending, startTransition] = useTransition();

  const form = useForm<AdvanceSalaryFormValues>({
    resolver: zodResolver(advanceSalarySchema),
    defaultValues: {
      reason: "",
      amount: "",
      date: "",
      paymentMethod: "",
      note: "",
    },
    mode: "onTouched",
  });

  const paymentMethod = form.watch("paymentMethod");

  useEffect(() => {
    if (open && staff) {
      form.reset({
        reason: "",
        amount: "",
        date: "",
        paymentMethod: "",
        note: "",
      });
    }
  }, [open, staff, form]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  const onSubmit = async (data: AdvanceSalaryFormValues) => {
    if (!staff) return;

    const payableAmount = staff.payableAmount ?? staff.totalSalary;
    const advanceAmount = parseFloat(data.amount);

    if (advanceAmount > payableAmount) {
      form.setError("amount", {
        type: "manual",
        message: `Advance amount cannot exceed the payable amount of ${new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(payableAmount)}`,
      });
      return;
    }

    startTransition(async () => {
      try {
        const { createAdvancedSalary } = await import("@/services/payroll/staff-payroll");

        const transactionId = paymentMethod === "BKASH" ? generateTransactionId() : undefined;

        const result = await createAdvancedSalary({
          staff_id: staff.id,
          advance_amount: parseFloat(data.amount),
          reason: data.reason,
          given_at: data.date,
          payment_method: data.paymentMethod,
          transaction_id: transactionId,
          payment_note: data.note?.trim() || undefined,
          is_deducted: false,
          advance_status: "ACTIVE",
        });

        if (result?.success) {
          toast.success(result.message || `Advance salary recorded for ${staff.name}.`);
          form.reset();
          handleOpenChange(false);
          onSuccess?.();
        } else {
          toast.error(result?.message || "Failed to record advance salary. Please try again.");
        }
      } catch (error) {
        console.error("Failed to create advance salary:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[calc(100%-1rem)] rounded-2xl border-0 bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.16)] sm:max-w-xl sm:p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Staff Advance Salary
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            {staff ? `Record an advance salary for ${staff.name}.` : "Record an advance salary for the selected staff."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-2 sm:space-y-5 sm:pt-3">
          <FormInput label="Reason" required placeholder="Write here...." error={form.formState.errors.reason?.message} {...form.register("reason")} inputClassName="h-12 rounded-xl border-slate-300 px-4 text-sm text-slate-700" containerClassName="space-y-2" labelClassName="text-sm font-medium text-slate-700" />

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            <FormInput label="Amount" required placeholder="Write here...." inputMode="numeric" error={form.formState.errors.amount?.message} {...form.register("amount")} inputClassName="h-12 rounded-xl border-slate-300 px-4 text-sm text-slate-700" containerClassName="space-y-2" labelClassName="text-sm font-medium text-slate-700" />

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 sm:text-base">Date<span className="text-destructive"> *</span></label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="date" className={`h-12 w-full rounded-xl border border-slate-300 bg-background pl-11 pr-4 text-sm text-slate-700 ${form.formState.errors.date ? "border-destructive" : ""}`} {...form.register("date")} />
              </div>
              {form.formState.errors.date?.message && (<p className="text-xs text-destructive">{form.formState.errors.date.message}</p>)}
            </div>
          </div>

          <FormSelect label="Payment Method" required options={PAYMENT_OPTIONS} placeholder="Select payment method" value={paymentMethod} onValueChange={(value) => {
            form.setValue("paymentMethod", value, { shouldValidate: true, shouldDirty: true });
          }} error={form.formState.errors.paymentMethod?.message} triggerClassName="h-12 w-full rounded-xl border-slate-300 px-4 text-sm text-slate-700" containerClassName="space-y-2" labelClassName="text-sm font-medium text-slate-700" />

          <FormInput label="Note" placeholder="Optional note..." error={form.formState.errors.note?.message} {...form.register("note")} inputClassName="h-12 rounded-xl border-slate-300 px-4 text-sm text-slate-700" containerClassName="space-y-2" labelClassName="text-sm font-medium text-slate-700" />

          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 pt-2">
            <Button variant="outline" type="button" className="h-12 rounded-xl" onClick={() => handleOpenChange(false)} disabled={isPending}>Cancel</Button>
            <Button type="submit" className="h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/80" disabled={isPending}>{isPending ? "Adding..." : "Add"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdvanceSalaryDialog;
