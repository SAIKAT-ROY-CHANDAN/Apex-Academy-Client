import { z } from "zod";

export const homeworkSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  academic_class_id: z.string().min(1, "Class is required"),
  academic_section_id: z.string().optional().or(z.literal("")),
  program_id: z.string().optional().or(z.literal("")),
  department_id: z.string().optional().or(z.literal("")),
  subject_id: z.string().min(1, "Subject is required"),
  teacher_id: z.string().min(1, "Teacher is required"),
  due_date: z.string().min(1, "Due date is required"),
});

export type HomeworkFormInput = z.input<typeof homeworkSchema>;
export type HomeworkFormValues = z.output<typeof homeworkSchema>;
