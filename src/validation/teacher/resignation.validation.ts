import z from "zod/v3";

export const applyResignationSchema = z.object({
  resignation_date: z.string().min(1, "Resignation date is required"),
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .max(1000, "Reason must be at most 1000 characters"),
});

export type ApplyResignationFormValues = z.infer<
  typeof applyResignationSchema
>;

export const addResignationSchema = z.object({
  teacher_id: z.string().min(1, "Please select a teacher"),
  resignation_date: z.string().min(1, "Resignation date is required"),
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .max(1000, "Reason must be at most 1000 characters"),
});

export type AddResignationFormValues = z.infer<typeof addResignationSchema>;

