import { z } from 'zod';

export type InstitutionType = string;

const baseShape = {
  class_name: z
    .string()
    .min(1, 'Class name is required')
    .max(100, 'Class name is too long'),
  program_id: z.string().optional().nullable(),
  department_id: z.string().optional().nullable(),
  class_level: z.coerce.number().int().positive().optional().nullable(),
  year_level: z.coerce.number().int().positive().optional().nullable(),
  group: z.string().optional().nullable(),
};

export function getAcademicClassSchema(institutionType?: InstitutionType | null) {
  const isSchool = institutionType?.toUpperCase() === 'SCHOOL';

  if (isSchool) {
    return z.object({
      ...baseShape,
      class_level: z.coerce
        .number({ error: 'Class level is required' })
        .int()
        .positive(),
      group: z.string().min(1, 'Group is required'),
    });
  }

  return z.object({
    ...baseShape,
    year_level: z.coerce
      .number({ error: 'Year level is required' })
      .int()
      .positive(),
    department_id: z.string().min(1, 'Department is required'),
    program_id: z.string().min(1, 'Program is required'),
  });
}

export type AcademicClassSchema = ReturnType<typeof getAcademicClassSchema>;
export type AcademicClassFormInput = z.input<AcademicClassSchema>;
export type AcademicClassFormValues = z.output<AcademicClassSchema>;