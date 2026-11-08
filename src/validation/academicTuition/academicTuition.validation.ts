import { z } from "zod";

export const academicTuitionValidation = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  tuitionAmount: z.coerce.number().optional().nullable(),
});

export type AcademicTuitionFormValues = z.infer<
  typeof academicTuitionValidation
>;
