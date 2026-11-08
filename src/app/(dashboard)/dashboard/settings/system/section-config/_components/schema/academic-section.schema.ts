import { z } from 'zod';

export const academicSectionSchema = z.object({
  section_name: z
    .string()
    .min(1, 'Section name is required')
    .max(100, 'Section name is too long'),
  class_id: z.string().min(1, 'Class is required'),
});

export type AcademicSectionFormInput = z.input<typeof academicSectionSchema>;
export type AcademicSectionFormValues = z.output<typeof academicSectionSchema>;