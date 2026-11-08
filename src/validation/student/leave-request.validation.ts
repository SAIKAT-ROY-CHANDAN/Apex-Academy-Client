import z from "zod/v3";

// Values MUST match the Prisma `LeaveType` enum in server/prisma/schema.prisma
// and the canonical lists in `@/constant/leave/leaveType` / `@/constant/leave/studentLeaveType`.
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
  "SICK_LEAVE",
  "DOCTORS_APPOINTMENT",
  "MENTAL_HEALTH_LEAVE",
  "FAMILY_FUNCTION",
  "EMERGENCY_LEAVE",
  "TRAVEL_VACATION",
  "EXAM_PREPARATION_LEAVE",
  "INTERNSHIP_PROJECT_WORK",
  "RELIGIOUS_FESTIVALS",
  "PERSONAL_REASONS",
]);

export const applyStudentLeaveSchema = z
  .object({
    leave_type: z.string().min(1, "Leave type is required"),
    reason: z
      .string()
      .min(10, "Reason must be at least 10 characters")
      .max(2000, "Reason must be at most 2000 characters"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
  })
  .refine(
    (data) => {
      if (!data.start_date || !data.end_date) return true;
      return new Date(data.end_date) >= new Date(data.start_date);
    },
    {
      message: "End date must be on or after the start date",
      path: ["end_date"],
    },
  );

export type ApplyStudentLeaveFormValues = z.infer<
  typeof applyStudentLeaveSchema
>;
