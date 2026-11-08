import z from "zod";

export const hostelFeeCollectionValidation = z
  .object({
    student_id: z.string().min(1, "Student is required"),
    collection_date: z.string().min(1, "Collection date is required"),
    total_amount: z.number().min(0.01, "Total amount must be greater than 0"),
    scholarship_amount: z
      .number()
      .min(0, "Scholarship amount cannot be negative")
      .optional(),
    paid_amount: z.number().min(0, "Paid amount cannot be negative"),
    due_amount: z.number().min(0, "Due amount cannot be negative"),
    hostelFeeCollectionItems: z
      .array(
        z.object({
          item_name: z
            .string()
            .min(1, "Item name is required")
            .max(255, "Item name must be 255 characters or fewer"),
          item_amount: z
            .number()
            .min(0.01, "Item amount must be greater than 0"),
        }),
      )
      .min(1, "At least one fee collection item is required"),
    // Meal fields allow zeros so an untouched meal section never blocks
    // submission; the submit handler omits the key entirely unless filled in.
    mealCollection: z
      .object({
        meal_count: z
          .number()
          .int("Meal count must be an integer")
          .min(0, "Meal count cannot be negative"),
        meal_rate: z.number().min(0, "Meal rate cannot be negative"),
        total_amount: z.number().min(0, "Meal total cannot be negative"),
      })
      .optional(),
  })
  .refine(
    (data) =>
      Math.abs(
        data.total_amount -
          (data.scholarship_amount ?? 0) -
          (data.paid_amount + data.due_amount),
      ) < 0.01,
    {
      message: "Total amount minus scholarship must equal paid + due",
      path: ["total_amount"],
    },
  );
