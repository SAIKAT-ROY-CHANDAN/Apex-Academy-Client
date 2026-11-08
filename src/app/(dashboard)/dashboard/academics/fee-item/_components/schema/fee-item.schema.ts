import { z } from "zod";
import { MONTHS, FeeAssignFor } from "../types/fee-item";

const toNullableNumber = (value: unknown) => {
  if (value === "" || value === null || value === undefined) return null;
  if (typeof value === "string") {
    const num = Number(value);
    return Number.isNaN(num) ? value : num;
  }
  return value;
};

const nullablePositiveNumber = z.preprocess(
  toNullableNumber,
  z
    .union([z.number().positive(), z.literal(null)])
    .nullable()
    .optional(),
);

const nullableDayOfMonth = z.preprocess(
  toNullableNumber,
  z
    .union([z.number().int().min(1).max(31), z.literal(null)])
    .nullable()
    .optional(),
);
export const feeItemSchema = z
  .object({
    fee_type_id: z.string().min(1, "Fee type is required"),
    name: z
      .string()
      .min(1, "Fee item name is required")
      .max(100, "Fee item name is too long"),
    FeeItemType: z.enum(["Monthly", "OneTime"], {
      error: "Fee item type is required",
    }),
    fee_assign_for: z.enum(
      ["REGULAR", "SUPPLEMENTARY"] as [FeeAssignFor, ...FeeAssignFor[]],
      {
        error: "Fee assign for is required",
      },
    ),
    isFine: z.boolean().default(false),
    payment_start_date: nullableDayOfMonth,
    last_payment_date: nullableDayOfMonth,
    everydayFine_amount: nullablePositiveNumber,
    amount: z.preprocess(
      toNullableNumber,
      z.number().nonnegative().nullable().optional(),
    ),
    amount_every_subject: z.coerce
      .number()
      .positive("Amount per subject must be greater than 0")
      .nullable()
      .optional(),
    feeStartMonth: z.enum(MONTHS).nullable().optional(),
    feeEndMonth: z.enum(MONTHS).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    // SUPPLEMENTARY fees are always OneTime and use amount_every_subject
    if (data.fee_assign_for === "SUPPLEMENTARY") {
      if (data.FeeItemType !== "OneTime") {
        ctx.addIssue({
          code: "custom",
          path: ["FeeItemType"],
          message: "Supplementary fee must be OneTime type",
        });
      }
      if (!data.amount_every_subject || data.amount_every_subject <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["amount_every_subject"],
          message: "Amount per subject is required for Supplementary fee",
        });
      }
      // Ignore month fields for supplementary
    } else {
      // REGULAR fees
      if (
        data.amount === null ||
        data.amount === undefined ||
        data.amount <= 0
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["amount"],
          message: "Amount is required for Regular fee",
        });
      }
      if (data.FeeItemType === "Monthly") {
        if (!data.feeStartMonth) {
          ctx.addIssue({
            code: "custom",
            path: ["feeStartMonth"],
            message: "Start month is required for Monthly fee",
          });
        }
        if (!data.feeEndMonth) {
          ctx.addIssue({
            code: "custom",
            path: ["feeEndMonth"],
            message: "End month is required for Monthly fee",
          });
        }
      }
    }
  });

export type FeeItemFormInput = z.input<typeof feeItemSchema>;
export type FeeItemFormValues = z.output<typeof feeItemSchema>;
