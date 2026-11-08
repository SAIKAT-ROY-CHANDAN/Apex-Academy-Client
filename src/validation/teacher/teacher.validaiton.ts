import z from "zod/v3";

export const createTeacherSchema = z.object({
  full_name: z.string().min(2, "Full name cannot be empty"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .max(15, "Phone number must be at most 15 characters"),
  bkash_number: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  gender: z.string().min(1, "Gender is required"),
  last_qualification: z.string().min(1, "Last qualification is required"),
  teacher_type: z.string().min(1, "Teacher type is required"),
  subject_id: z.string().optional().or(z.literal("")),
  shift_id: z.string().optional().or(z.literal("")),
  designation_id: z.string().min(1, "Designation is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});