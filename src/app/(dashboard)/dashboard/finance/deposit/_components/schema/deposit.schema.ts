import { z } from 'zod';

export const depositItemSchema = z.object({
  item_name: z.string().min(1, 'Item name is required'),
  item_amount: z.coerce
    .number({ error: 'Item amount is required' })
    .positive('Item amount must be greater than 0'),
  description: z.string().optional(),
});

export const depositSchema = z.object({
  deposit_type_id: z.string().min(1, 'Deposit type is required'),
  total_amount: z.coerce
    .number({ error: 'Total amount is required' })
    .positive('Total amount must be greater than 0'),
  deposit_date: z.string().optional(),
  description: z.string().optional(),
  depositItems: z.array(depositItemSchema).min(1, 'At least one deposit item is required'),
});

export type DepositFormInput = z.input<typeof depositSchema>;
export type DepositFormValues = z.output<typeof depositSchema>;
export type DepositItemFormValues = z.output<typeof depositItemSchema>;