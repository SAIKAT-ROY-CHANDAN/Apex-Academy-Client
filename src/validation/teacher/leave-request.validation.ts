import z from "zod/v3";

// Values MUST match the Prisma `LeaveType` enum in server/prisma/schema.prisma
// and the canonical list in `@/constant/leave/leaveType`.
export const LeaveTypeEnum = z.enum([
  "LEAVE_WITHOUT_PAY",
  "SICK",
  "PAID_TIME_OFF",
  "CASUAL",
  "EARNED",
  "COMPENSATORY_OFF",
  "LOSS_OF_PAY",
  "MATERNITY",
  "ANNUAL",
]);

export const applyLeaveRequestSchema = z
  .object({
    leave_start_date: z.string().min(1, "Start date is required"),
    leave_end_date: z.string().min(1, "End date is required"),
    leave_type: z.string().min(1, "Leave type is required"),
    leave_application: z
      .string()
      .min(10, "Leave application must be at least 10 characters")
      .max(1000, "Leave application must be at most 1000 characters"),
  })
  .refine(
    (data) => {
      if (!data.leave_start_date || !data.leave_end_date) return true;
      return new Date(data.leave_end_date) >= new Date(data.leave_start_date);
    },
    {
      message: "End date must be on or after the start date",
      path: ["leave_end_date"],
    },
  );

export type ApplyLeaveRequestFormValues = z.infer<
  typeof applyLeaveRequestSchema
>;
