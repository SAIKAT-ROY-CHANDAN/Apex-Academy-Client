/**
 * Canonical Leave Type definitions.
 *
 * These values MUST stay in sync with the `LeaveType` enum in
 * `server/prisma/schema.prisma`. Never hardcode a leave type anywhere else —
 * import it from here.
 *
 * NOTE: this enum is SHARED by staff leaves, teacher leave requests and
 * student leave requests, so a change here affects all three features.
 */
export const LEAVE_TYPES = [
  { id: "LEAVE_WITHOUT_PAY", name: "Leave without Pay" },
  { id: "SICK", name: "Sick Leave" },
  { id: "PAID_TIME_OFF", name: "Paid Time Off" },
  { id: "CASUAL", name: "Casual Leave" },
  { id: "EARNED", name: "Privilege/Earned Leave" },
  { id: "COMPENSATORY_OFF", name: "Compensatory Off" },
  { id: "LOSS_OF_PAY", name: "Loss of Pay" },
  { id: "MATERNITY", name: "Maternity Leave" },
  { id: "ANNUAL", name: "Annual Leave" },
] as const;

export type LeaveTypeValue = (typeof LEAVE_TYPES)[number]["id"];

export const LEAVE_TYPE_LABELS: Record<string, string> = LEAVE_TYPES.reduce(
  (acc, type) => {
    acc[type.id] = type.name;
    return acc;
  },
  {} as Record<string, string>,
);

export const LEAVE_TYPE_OPTIONS: { label: string; value: string }[] =
  LEAVE_TYPES.map((type) => ({ label: type.name, value: type.id }));

export const LEAVE_TYPE_ICONS: Record<string, string> = {
  LEAVE_WITHOUT_PAY: "💸",
  SICK: "🏥",
  PAID_TIME_OFF: "🌴",
  CASUAL: "☕",
  EARNED: "⭐",
  COMPENSATORY_OFF: "🔄",
  LOSS_OF_PAY: "📉",
  MATERNITY: "🤱",
  ANNUAL: "🏖️",
};

/** Human readable label for a raw enum value, e.g. `PAID_TIME_OFF` -> `Paid Time Off`. */
export const formatLeaveType = (value?: string | null): string => {
  if (!value) return "N/A";
  return LEAVE_TYPE_LABELS[value] ?? value.replace(/_/g, " ");
};

export const formatLeaveTypeIcon = (value?: string | null): string =>
  (value && LEAVE_TYPE_ICONS[value]) || "📋";
