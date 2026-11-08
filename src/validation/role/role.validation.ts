import { z } from "zod/v3";

export const createRoleValidation = z.object({
  role_name: z
    .string()
    .min(1, "Role name is required")
    .max(100, "Role name must be 100 characters or fewer"),
  permissions: z.array(z.string()).min(1, "At least one permission is required"),
});

export type CreateRoleFormValues = z.infer<typeof createRoleValidation>;