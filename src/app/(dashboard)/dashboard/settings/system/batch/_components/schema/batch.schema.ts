import { z } from 'zod';

export const batchSchema = z.object({
  batch_name: z
    .string()
    .min(1, 'Batch name is required')
    .max(100, 'Batch name is too long'),
});

export type BatchFormInput = z.input<typeof batchSchema>;
export type BatchFormValues = z.output<typeof batchSchema>;