import {
  formatLeaveType,
  formatLeaveTypeIcon,
  LEAVE_TYPE_ICONS,
  LEAVE_TYPE_LABELS,
  LEAVE_TYPES,
} from "@/constant/leave/leaveType";
import { LeaveStatus } from "@/types/modules/teacher/leave-request.type";

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

export {
  ADMINISTRATIVE_POSITION_LABELS,
  ADMINISTRATIVE_POSITIONS,
  TEACHER_TYPES,
} from "../_constants";

export const formatDate = (isoDate: string) => {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDateLong = (isoDate: string) => {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const getLeaveDays = (start: string, end: string) => {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
};

export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
