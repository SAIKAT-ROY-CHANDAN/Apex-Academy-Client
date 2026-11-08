import z from "zod/v3";

export const InstitutionType = {
  SCHOOL: "SCHOOL",
  COLLEGE_UNIVERSITY: "COLLEGE_UNIVERSITY",
} as const;

export const DayOfWeek = {
  SUNDAY: "SUNDAY",
  MONDAY: "MONDAY",
  TUESDAY: "TUESDAY",
  WEDNESDAY: "WEDNESDAY",
  THURSDAY: "THURSDAY",
  FRIDAY: "FRIDAY",
  SATURDAY: "SATURDAY",
} as const;

const weekdayEnum = z.nativeEnum(DayOfWeek);

export const setupInstitutionValidation = z.object({
  mode: z.enum(
    [InstitutionType.SCHOOL, InstitutionType.COLLEGE_UNIVERSITY],
    { message: "Invalid institution type" },
  ),
  name: z
    .string({ required_error: "Institution name is required" })
    .min(1, { message: "Institution name is required" }),
  address: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal("")),
  color_scheme: z.string().optional().or(z.literal("")),
  weekend_days: z.array(weekdayEnum).optional(),
});

export type SetupInstitutionFormValues = z.input<typeof setupInstitutionValidation>;