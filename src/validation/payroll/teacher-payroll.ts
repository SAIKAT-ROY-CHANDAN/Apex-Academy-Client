import z from "zod";

export const BD_PHONE_REGEX = /^01[3-9]\d{8}$/;

export const advanceSalarySchema = z.object({
  reason: z
    .string()
    .min(3, "Reason must be at least 3 characters")
    .max(500, "Reason is too long"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !Number.isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: "Amount must be a positive number",
    }),
  date: z.string().min(1, "Date is required"),
  paymentMethod: z
    .string()
    .min(1, "Payment method is required")
    .refine((v) => ["CASH", "BANK", "BANK_TRANSFER", "BKASH", "NAGAD", "CHECK"].includes(v), {
      message: "Invalid payment method",
    }),
  note: z.string().optional(),
});
