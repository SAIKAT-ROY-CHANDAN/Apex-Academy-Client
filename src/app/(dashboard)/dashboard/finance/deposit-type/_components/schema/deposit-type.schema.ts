import { z } from 'zod';

export const depositTypeSchema = z.object({
  name: z
    .string()
    .min(1, 'Deposit type name is required')
    .max(100, 'Deposit type name is too long'),
});

export type DepositTypeFormInput = z.input<typeof depositTypeSchema>;
export type DepositTypeFormValues = z.output<typeof depositTypeSchema>;