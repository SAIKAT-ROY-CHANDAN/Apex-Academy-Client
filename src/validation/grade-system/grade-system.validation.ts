import z from "zod/v3";

export const createGradeSystemSchema = z.object({
  grade_name: z.string().min(1, "Grade name cannot be empty"),
  grade_point: z.number().min(0, "Grade point must be non-negative"),
  mark_from: z.number().min(0, "Mark from must be non-negative"),
  mark_to: z.number().min(0, "Mark to must be non-negative"),
  remark: z.string().optional().or(z.literal("")),
});

export const updateGradeSystemSchema = z.object({
  grade_name: z.string().min(1, "Grade name cannot be empty").optional(),
  grade_point: z.number().min(0, "Grade point must be non-negative").optional(),
  mark_from: z.number().min(0, "Mark from must be non-negative").optional(),
  mark_to: z.number().min(0, "Mark to must be non-negative").optional(),
  remark: z.string().optional().or(z.literal("")),
});

export type TGradeSystemFormValues = z.infer<typeof createGradeSystemSchema>;
