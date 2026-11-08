import { z } from "zod";

// useFieldArray needs objects, not raw strings — { value } wraps each subject name
export const subjectSchema = z.object({
  program_id: z.string().min(1, "Program is required"),
  department_id: z.string().min(1, "Department is required"),
  class_id: z.string().min(1, "Class is required"),
  subjects: z
    .array(
      z.object({
        value: z.string().min(1, "Subject name is required"),
      }),
    )
    .min(1, "Add at least one subject")
    .refine(
      (subjects) => {
        const names = subjects.map((s) => s.value.trim().toLowerCase());
        return new Set(names).size === names.length;
      },
      { message: "Subject names must be unique" },
    ),
});

export type SubjectFormInput = z.input<typeof subjectSchema>;
export type SubjectFormValues = z.output<typeof subjectSchema>;
