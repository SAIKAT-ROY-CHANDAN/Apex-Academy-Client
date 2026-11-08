import { z } from "zod";

export const academicSyllabusValidation = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
});

export type AcademicSyllabusFormValues = z.infer<
  typeof academicSyllabusValidation
>;
