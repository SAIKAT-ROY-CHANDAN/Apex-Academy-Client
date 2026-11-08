import { z } from 'zod';

export const expenseTypeSchema = z.object({
  name: z
    .string()
    .min(1, 'Expense type name is required')
    .max(100, 'Expense type name is too long'),
});

export type ExpenseTypeFormInput = z.input<typeof expenseTypeSchema>;
export type ExpenseTypeFormValues = z.output<typeof expenseTypeSchema>;