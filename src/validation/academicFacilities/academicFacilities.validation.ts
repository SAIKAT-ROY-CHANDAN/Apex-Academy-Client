import { z } from "zod";

export const ACADEMIC_FACILITIES_TYPE = [
  "CAMPUS",
  "SCHOLARSHIP",
  "LIBRARY",
  "STUDENT_CLUB",
] as const;

export type AcademicFacilitiesType =
  (typeof ACADEMIC_FACILITIES_TYPE)[number];

export const academicFacilitiesValidation = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  description: z.string().optional().nullable(),
  facilities_type: z.enum(ACADEMIC_FACILITIES_TYPE).optional().nullable(),
});

export type AcademicFacilitiesFormValues = z.infer<
  typeof academicFacilitiesValidation
>;
