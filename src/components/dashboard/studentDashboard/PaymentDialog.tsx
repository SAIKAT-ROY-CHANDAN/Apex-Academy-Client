"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  CircleCheck,
  Loader2,
  AlertCircle,
  Smartphone,
} from "lucide-react";
import LedgerRow from "./LedgerRow";
import { initiateStudentBkashPayment } from "@/services/student";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";

const paymentSchema = z.object({
  feeId: z.string().min(1, "Fee record is required"),
  label: z.string().min(1, "Label is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  kind: z.string().min(1, "Payment type is required"),
  payment_method: z.literal("BKASH").default("BKASH"),
  payment_note: z.string().max(100).optional(),
});

type PaymentFormInput = z.input<typeof paymentSchema>;
type PaymentFormValues = z.output<typeof paymentSchema>;

export default function PaymentDialog({ payment, onClose }: any) {
  const router = useRouter();
  const [paid, setPaid] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const taka = (amount: any) => {
    return `\u09F3${new Intl.NumberFormat("en-IN").format(amount || 0)}`;
  };

  const form = useForm<PaymentFormInput, any, PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      feeId: payment?.id || "",
      label: payment?.label || "",
      amount: payment?.amount || 0,
      kind: payment?.kind || "",
      payment_method: "BKASH",
      payment_note: undefined,
    },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    setPaid(false);
    setServerError(null);
    form.reset({
      feeId: payment?.id || "",
      label: payment?.label || "",
      amount: payment?.amount || 0,
      kind: payment?.kind || "",
      payment_method: "BKASH",
      payment_note: undefined,
    });
  }, [payment, form]);

  const onSubmit = async (_values: PaymentFormValues) => {
    setServerError(null);
    try {
      const response = await initiateStudentBkashPayment();
      if (response?.success && response?.data?.bkashURL) {
        window.location.href = response.data.bkashURL;
      } else {
        setServerError(response?.message ?? "Failed to initiate bKash payment");
        return;
      }
    } catch (err: unknown) {
      setServerError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
      return;
    }

    setPaid(true);
    router.refresh();
  };

  return (
    <Dialog open={!!payment} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        {!paid ? (
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle
                className="text-lg"
                style={{ fontFamily: "ui-serif, Georgia, serif" }}
              >
                Confirm payment
              </DialogTitle>
            </DialogHeader>
            <div className="rounded-lg border border-dashed border-slate-200 p-4">
              <LedgerRow label="For" value={payment?.label} />
              <LedgerRow label="Type" value={payment?.kind} muted />
              <div className="mt-2 border-t border-slate-100 pt-2">
                <LedgerRow
                  label="Amount to pay"
                  value={taka(payment?.amount)}
                  strong
                />
              </div>
            </div>

            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-3 rounded-lg border border-pink-100 bg-pink-50 px-3 py-2.5">
                <Smartphone className="h-4 w-4 text-pink-600" />
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Payment method
                  </p>
                  <p className="text-xs text-slate-500">
                    bKash only for student portal payments
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Payment Note (optional)
                </label>
                <Controller
                  name="payment_note"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      className="mt-1"
                      placeholder="e.g. Partial payment"
                      value={(field.value ?? "") as string}
                    />
                  )}
                />
              </div>
            </div>

            {serverError && (
              <div className="mt-3 flex items-center gap-2 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {serverError}
              </div>
            )}

            <DialogFooter>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full gap-2 bg-slate-900 text-white hover:bg-slate-800"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4" />
                    Pay {taka(payment?.amount)} now
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CircleCheck className="h-12 w-12 text-emerald-500" />
            <div>
              <p className="font-semibold text-slate-900">Payment recorded</p>
              <p className="text-sm text-slate-500">
                {taka(payment?.amount)} for {payment?.label}
              </p>
            </div>
            <Button variant="outline" className="mt-2 w-full" onClick={onClose}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
