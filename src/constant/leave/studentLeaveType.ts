/**
 * Canonical Student Leave Type definitions.
 *
 * Specific to student leave requests:
 * Sick Leave, Doctor's Appointment, Mental Health Leave, Family Function,
 * Emergency Leave, Travel/Vacation, Exam Preparation Leave, Internship/Project Work,
 * Religious Festivals, Personal Reasons.
 */
export const STUDENT_LEAVE_TYPES = [
  { id: "SICK_LEAVE", name: "Sick Leave" },
  { id: "DOCTORS_APPOINTMENT", name: "Doctor's Appointment" },
  { id: "MENTAL_HEALTH_LEAVE", name: "Mental Health Leave" },
  { id: "FAMILY_FUNCTION", name: "Family Function" },
  { id: "EMERGENCY_LEAVE", name: "Emergency Leave" },
  { id: "TRAVEL_VACATION", name: "Travel/Vacation" },
  { id: "EXAM_PREPARATION_LEAVE", name: "Exam Preparation Leave" },
  { id: "INTERNSHIP_PROJECT_WORK", name: "Internship/Project Work" },
  { id: "RELIGIOUS_FESTIVALS", name: "Religious Festivals" },
  { id: "PERSONAL_REASONS", name: "Personal Reasons" },
] as const;

export type StudentLeaveTypeValue = (typeof STUDENT_LEAVE_TYPES)[number]["id"];

export const STUDENT_LEAVE_TYPE_OPTIONS: { label: string; value: string }[] =
  STUDENT_LEAVE_TYPES.map((type) => ({ label: type.name, value: type.id }));

export const STUDENT_LEAVE_TYPE_LABELS: Record<string, string> =
  STUDENT_LEAVE_TYPES.reduce(
    (acc, type) => {
      acc[type.id] = type.name;
      return acc;
    },
    {
      // Backward compatibility for legacy enum values
      SICK: "Sick Leave",
      CASUAL: "Personal Reasons",
      PAID_TIME_OFF: "Travel/Vacation",
      EMERGENCY: "Emergency Leave",
    } as Record<string, string>,
  );

export const STUDENT_LEAVE_TYPE_ICONS: Record<string, string> = {
  SICK_LEAVE: "🤒",
  DOCTORS_APPOINTMENT: "🩺",
  MENTAL_HEALTH_LEAVE: "🧠",
  FAMILY_FUNCTION: "🎉",
  EMERGENCY_LEAVE: "🚨",
  TRAVEL_VACATION: "✈️",
  EXAM_PREPARATION_LEAVE: "📚",
  INTERNSHIP_PROJECT_WORK: "💼",
  RELIGIOUS_FESTIVALS: "✨",
  PERSONAL_REASONS: "📝",
  // Backward compatibility
  SICK: "🤒",
  CASUAL: "📝",
  PAID_TIME_OFF: "✈️",
};

export const formatStudentLeaveType = (value?: string | null): string => {
  if (!value) return "N/A";
  return STUDENT_LEAVE_TYPE_LABELS[value] ?? value.replace(/_/g, " ");
};

export const formatStudentLeaveTypeIcon = (value?: string | null): string =>
  (value && STUDENT_LEAVE_TYPE_ICONS[value]) || "📋";
