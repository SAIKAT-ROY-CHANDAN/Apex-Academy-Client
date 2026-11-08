/**
 * Canonical Staff Type definitions.
 *
 * These values MUST stay in sync with the `StaffType` enum in
 * `server/prisma/schema.prisma`. Never hardcode a staff type anywhere else —
 * import it from here.
 */
export const STAFF_TYPES = [
  { id: "REGULAR", name: "Regular" },
  { id: "CONTRACTUAL", name: "Contractual" },
  { id: "PARTTIME", name: "Parttime" },
  { id: "OTHERS", name: "Others" },
] as const;

export type StaffTypeValue = (typeof STAFF_TYPES)[number]["id"];

export const STAFF_TYPE_LABELS: Record<string, string> = STAFF_TYPES.reduce(
  (acc, type) => {
    acc[type.id] = type.name;
    return acc;
  },
  {} as Record<string, string>,
);

export const STAFF_TYPE_OPTIONS: { label: string; value: string }[] =
  STAFF_TYPES.map((type) => ({ label: type.name, value: type.id }));

/** Human readable label for a raw enum value, e.g. `PARTTIME` -> `Parttime`. */
export const formatStaffType = (value?: string | null): string => {
  if (!value) return "N/A";
  return STAFF_TYPE_LABELS[value] ?? value.replace(/_/g, " ");
};
