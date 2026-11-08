import { z } from "zod/v3";

export const createShiftValidation = z.object({
  name: z
    .string()
    .min(1, "Shift name is required")
    .max(100, "Shift name must be 100 characters or fewer"),
  start_time: z
    .string()
    .min(1, "Start time is required"),
  end_time: z
    .string()
    .min(1, "End time is required"),
}).refine(
  (data) => {
    if (!data.start_time || !data.end_time) return true;
    return data.start_time < data.end_time;
  },
  {
    message: "End time must be after start time",
    path: ["end_time"],
  }
);

export type CreateShiftFormValues = z.infer<typeof createShiftValidation>;