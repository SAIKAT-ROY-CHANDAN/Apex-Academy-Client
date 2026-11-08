import { z } from 'zod';

export const academicSessionSchema = z.object({
  session_name: z
    .string()
    .min(1, 'Session name is required')
    .max(100, 'Session name is too long'),
});

export type AcademicSessionFormInput = z.input<typeof academicSessionSchema>;
export type AcademicSessionFormValues = z.output<typeof academicSessionSchema>;