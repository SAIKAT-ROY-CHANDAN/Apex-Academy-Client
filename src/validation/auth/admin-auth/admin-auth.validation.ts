import z from "zod/v3";

export const adminLoginValidation = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export const createAdminUserValidation = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or fewer"),
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters long" }),
  roleId: z
    .string({ required_error: "Role is required" })
    .min(1, "Role is required"),
});

export const updateAdminUserValidation = z.object({
  name: z.string().optional(),
  roleId: z.string().optional(),
});
