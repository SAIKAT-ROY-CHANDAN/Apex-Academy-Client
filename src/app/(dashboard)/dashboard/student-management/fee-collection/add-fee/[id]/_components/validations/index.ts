import { z } from "zod";

const MONTHS = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
] as const;

const feeCollectionItemSchema = z.object({
  fee_item_id: z.string().min(1, "Fee item is required"),
  fee_month: z.enum(MONTHS).nullable().optional(),
  fee_year: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    z
      .union([z.coerce.number().min(2020), z.literal(null)])
      .nullable()
      .optional(),
  ),
  discount_amount: z.coerce.number().min(0).optional(),
  paid_amount: z.coerce.number().min(0).optional(),
  line_total_amount: z.coerce.number().min(0).optional(),
});

export const studentFeeCollectionSchema = z.object({
  student_id: z.string().min(1, "Student is required"),
  fee_type_id: z.string().min(1, "Fee type is required"),
  payment_method: z.enum(["BANK", "CASH", "BKASH"]).default("CASH"),
  payment_note: z.string().max(100).optional(),
  payment_date: z
    .string()
    .min(1, "Payment date is required")
    .optional()
    .default(new Date().toISOString().split("T")[0]),
  items: z.array(feeCollectionItemSchema).min(1, "Add at least one fee item"),
});

export type StudentFeeCollectionFormInput = z.input<
  typeof studentFeeCollectionSchema
>;
export type StudentFeeCollectionFormValues = z.output<
  typeof studentFeeCollectionSchema
>;
