import { z } from 'zod';

export const expenseItemSchema = z.object({
  item_name: z.string().min(1, 'Item name is required'),
  item_amount: z.coerce
    .number({ error: 'Item amount is required' })
    .positive('Item amount must be greater than 0'),
  description: z.string().optional(),
});

export const expenseSchema = z.object({
  expense_type_id: z.string().min(1, 'Expense type is required'),
  total_amount: z.coerce
    .number({ error: 'Total amount is required' })
    .positive('Total amount must be greater than 0'),
  expense_date: z.string().optional(),
  description: z.string().optional(),
  expenseItems: z.array(expenseItemSchema).min(1, 'At least one expense item is required'),
});

export type ExpenseFormInput = z.input<typeof expenseSchema>;
export type ExpenseFormValues = z.output<typeof expenseSchema>;
export type ExpenseItemFormValues = z.output<typeof expenseItemSchema>;