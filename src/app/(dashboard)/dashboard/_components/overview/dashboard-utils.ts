import {
  formatTeacherType,
  TEACHER_TYPE_COLORS,
} from "@/constant/teacher/teacherType";

export const GENDER_COLORS: Record<string, string> = {
  MALE: "#3B82F6",
  FEMALE: "#EC4899",
  OTHER: "#9CA3AF",
};

export const RELIGION_COLORS: Record<string, string> = {
  ISLAM: "#22C55E",
  HINDU: "#F97316",
  CHRISTIAN: "#3B82F6",
  BUDDHIST: "#EAB308",
  OTHER: "#9CA3AF",
};

export { TEACHER_TYPE_COLORS };

export const LEAVE_STATUS_COLORS: Record<string, string> = {
  approved: "#22C55E",
  pending: "#EAB308",
  rejected: "#EF4444",
};

export const capitalize = (str: string) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatEnumLabel = (value: string | null | undefined) => {
  if (!value) return "Unknown";
  return value
    .split("_")
    .map((word) => capitalize(word))
    .join(" ");
};

export const genderToPieData = (gender: Record<string, number>) => {
  return Object.entries(gender ?? {}).map(([key, value]) => ({
    name: formatEnumLabel(key),
    value,
    fill: GENDER_COLORS[key] ?? "#9CA3AF",
  }));
};

export const religionToPieData = (
  religion: Array<{ religion: string | null; count: number }>,
) => {
  return (religion ?? []).map((item) => ({
    name: formatEnumLabel(item.religion),
    value: item.count,
    fill: RELIGION_COLORS[item.religion ?? ""] ?? "#9CA3AF",
  }));
};

export const teacherTypeToPieData = (
  typeWise: Array<{ teacherType: string | null; count: number }>,
) => {
  return (typeWise ?? []).map((item) => ({
    name: formatTeacherType(item.teacherType),
    value: item.count,
    fill: TEACHER_TYPE_COLORS[item.teacherType ?? ""] ?? "#9CA3AF",
  }));
};

export const hasPieData = (data: Array<{ value: number }>) => {
  return data.some((item) => item.value > 0);
};