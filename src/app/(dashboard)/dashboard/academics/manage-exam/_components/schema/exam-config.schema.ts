import { z } from 'zod';

export const examConfigSchema = z.object({
  academic_class_id: z.string().min(1, 'Class is required'),
  program_id: z.string().min(1, 'Program is required'),
  department_id: z.string().min(1, 'Department is required'),
  // Optional: existing exams have no section. To make it required later,
  // change this one line to: z.string().min(1, 'Section is required')
  section_id: z.string().optional(),
  exam_name: z.string().min(1, 'Exam name is required'),
  exam_date: z.string().min(1, 'Exam date is required'),
});

export type ExamConfigFormInput = z.infer<typeof examConfigSchema>;
export type ExamConfigFormValues = z.infer<typeof examConfigSchema>;

/** API payload: like the form values, but the section goes as `sectionId`
 *  (and only when one is selected). */
export type ExamConfigPayload = Omit<ExamConfigFormValues, 'section_id'> & {
  sectionId?: string;
};

/** Maps form values to the API payload, dropping an empty section. */
export const toExamConfigPayload = (
  values: ExamConfigFormValues,
): ExamConfigPayload => {
  const { section_id, ...rest } = values;
  return section_id ? { ...rest, sectionId: section_id } : rest;
};
