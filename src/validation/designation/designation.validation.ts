import z from "zod";

export const designationValidation = z.object({
  name: z
    .string()
    .min(1, "Designation name is required")
    .max(100, "Designation name must be 100 characters or fewer"),
});
