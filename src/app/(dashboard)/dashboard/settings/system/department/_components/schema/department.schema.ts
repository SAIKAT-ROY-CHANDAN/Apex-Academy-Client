import { z } from 'zod';

export const departmentSchema = z.object({
  department_name: z
    .string()
    .min(1, 'Department name is required')
    .max(100, 'Department name is too long'),
  program_id: z.string().min(1, 'Program is required'),
});

export type DepartmentFormInput = z.input<typeof departmentSchema>;
export type DepartmentFormValues = z.output<typeof departmentSchema>;