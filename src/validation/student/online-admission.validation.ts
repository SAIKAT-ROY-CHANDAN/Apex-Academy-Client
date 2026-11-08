import z from "zod/v3";

export const GenderEnum = z.enum(["Male", "Female", "Other"]);
export const ReligionEnum = z.enum([
  "Islam",
  "Hinduism",
  "Buddhism",
  "Christianity",
  "Other",
]);

export const onlineAdmissionSchema = z
  .object({
    name: z.string().min(1, "Full name is required"),
    father_name: z.string().min(1, "Father's name is required"),
    mother_name: z.string().min(1, "Mother's name is required"),
    gender: z.string().min(1, "Gender is required"),
    nid_no: z.string().optional(),
    date_of_birth: z.string().min(1, "Date of birth is required"),
    student_phone: z.string().optional(),
    father_phone: z.string().min(1, "Father's phone is required"),
    mother_phone: z.string().optional(),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string().min(1, "Please confirm your password"),
    village_road: z.string().optional(),
    post_office: z.string().optional(),
    sub_district: z.string().min(1, "Sub-district is required"),
    district: z.string().min(1, "District is required"),
    religion: z.string().optional(),
    degree: z.string().optional(),
    major_subject: z.string().optional(),
    institution: z.string().optional(),
    cgpa: z.string().optional(),
    graduation_year: z.string().optional(),
    photo: z.any().optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type OnlineAdmissionFormValues = z.infer<typeof onlineAdmissionSchema>;
