import { z } from "zod/v3";

const attendanceStatusEnum = z.enum(["PRESENT", "ABSENT"]);
const studentGroupEnum = z.enum(["SCIENCE", "COMMERCE", "HUMANITIES"]);

const studentAttendanceBody = z.object({
  student_id: z
    .string({ required_error: "Student ID is required" })
    .min(1, "Student ID is required"),
  attendance_status: attendanceStatusEnum,
  teacher_id: z
    .string({ required_error: "Teacher ID is required" })
    .min(1, "Teacher ID is required"),
  attendance_date: z
    .string({ required_error: "Attendance date is required" })
    .min(1, "Attendance date is required"),
  subject_id: z.string().optional(),
  group: studentGroupEnum.optional(),
  academic_class_id: z.string().optional(),
});

export const createManyStudentAttendancesValidation = z.object({
  attendances: z
    .array(studentAttendanceBody)
    .min(1, "At least one attendance record is required"),
});
