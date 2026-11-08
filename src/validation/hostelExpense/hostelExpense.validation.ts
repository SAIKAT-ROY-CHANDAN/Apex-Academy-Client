import z from "zod";

export const hostelExpenseValidation = z.object({
  expense_date: z
    .string()
    .min(1, "Expense date is required"),
  total_amount: z
    .number()
    .min(0.01, "Total amount must be greater than 0"),
  hostelExpenseItems: z
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
    .min(1, "At least one expense item is required"),
});
