import {
  formatLeaveType,
  formatLeaveTypeIcon,
  LEAVE_TYPE_ICONS,
  LEAVE_TYPE_LABELS,
  LEAVE_TYPES,
} from "@/constant/leave/leaveType";
import { LeaveStatus } from "@/types/modules/staff/staff-leave.type";

export {
  formatLeaveType,
  formatLeaveTypeIcon,
  LEAVE_TYPE_ICONS,
  LEAVE_TYPE_LABELS,
  LEAVE_TYPES,
};

/** `{ id, name }` shaped options, matching `LEAVE_STATUS_OPTIONS` below. */
export const LEAVE_TYPE_OPTIONS = LEAVE_TYPES.map((type) => ({
  id: type.id,
  name: type.name,
}));

export const STATUS_BADGE_STYLES: Record<LeaveStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

export const STATUS_LABELS: Record<LeaveStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const STATUS_ICONS: Record<LeaveStatus, string> = {
  PENDING: "⏳",
  APPROVED: "✅",
  REJECTED: "❌",
};

export const LEAVE_STATUS_OPTIONS = [
  { id: LeaveStatus.PENDING, name: "Pending" },
  { id: LeaveStatus.APPROVED, name: "Approved" },
  { id: LeaveStatus.REJECTED, name: "Rejected" },
];

export const formatDate = (value?: string | null) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateLong = (value?: string | null) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const toDateInputValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

export const getInitials = (name?: string | null) =>
  (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

export const getLeaveDays = (start?: string | null, end?: string | null) => {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()))
    return 0;
  const diff = endDate.getTime() - startDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
};
