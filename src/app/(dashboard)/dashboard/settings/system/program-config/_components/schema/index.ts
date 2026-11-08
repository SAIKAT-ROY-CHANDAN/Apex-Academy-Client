import { z } from 'zod';

export const programSchema = z.object({
  program_name: z
    .string()
    .min(1, 'Program name is required')
    .max(100, 'Program name is too long'),
  duration_years: z.coerce.number().int().positive().optional().nullable(),
});

export type ProgramFormInput = z.input<typeof programSchema>;
export type ProgramFormValues = z.output<typeof programSchema>;