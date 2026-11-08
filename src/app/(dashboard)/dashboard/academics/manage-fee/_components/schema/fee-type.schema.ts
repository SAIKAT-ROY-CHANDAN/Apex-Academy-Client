import { z } from 'zod';

export const feeTypeSchema = z.object({
  name: z
    .string()
    .min(1, 'Fee type name is required')
    .max(100, 'Fee type name is too long'),
  class_id: z.string().min(1, 'Class is required'),
});

export type FeeTypeFormInput = z.input<typeof feeTypeSchema>;
export type FeeTypeFormValues = z.output<typeof feeTypeSchema>;
