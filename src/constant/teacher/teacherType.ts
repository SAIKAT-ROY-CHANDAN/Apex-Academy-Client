/**
 * Canonical Teacher Type definitions.
 *
 * These values MUST stay in sync with the `TeacherType` enum in
 * `server/prisma/schema.prisma`. Never hardcode a teacher type anywhere else —
 * import it from here.
 */
export const TEACHER_TYPES = [
  { id: "PERMANENT", name: "Permanent" },
  { id: "REGULAR", name: "Regular" },
  { id: "ADHOC", name: "Adhoc" },
  { id: "PROVISIONAL", name: "Provisional" },
  { id: "SUBSTITUTE", name: "Substitute" },
  { id: "GUEST", name: "Guest" },
  { id: "PART_TIME", name: "Part-time" },
  { id: "OTHERS", name: "Others" },
] as const;

export type TeacherTypeValue = (typeof TEACHER_TYPES)[number]["id"];

export const TEACHER_TYPE_LABELS: Record<string, string> =
  TEACHER_TYPES.reduce(
    (acc, type) => {
      acc[type.id] = type.name;
      return acc;
    },
    {} as Record<string, string>,
  );

export const TEACHER_TYPE_COLORS: Record<string, string> = {
  PERMANENT: "#22C55E",
  REGULAR: "#3B82F6",
  ADHOC: "#F97316",
  PROVISIONAL: "#EAB308",
  SUBSTITUTE: "#EF4444",
  GUEST: "#8B5CF6",
  PART_TIME: "#06B6D4",
  OTHERS: "#9CA3AF",
};

/** Human readable label for a raw enum value, e.g. `PART_TIME` -> `Part-time`. */
export const formatTeacherType = (value?: string | null): string => {
  if (!value) return "N/A";
  return TEACHER_TYPE_LABELS[value] ?? value;
};
