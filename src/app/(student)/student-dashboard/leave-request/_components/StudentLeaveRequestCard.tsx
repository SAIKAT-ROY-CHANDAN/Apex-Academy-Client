"use client";

import { FaCalendar, FaClock, FaFileLines } from "react-icons/fa6";
import {
  STUDENT_LEAVE_TYPE_ICONS,
  STUDENT_LEAVE_TYPE_LABELS,
} from "@/constant/leave/studentLeaveType";
import type {
  LeaveStatus,
  TStudentLeaveRequest,
} from "@/types/modules/student/leave-request.type";

const LEAVE_TYPE_LABELS: Record<string, string> = STUDENT_LEAVE_TYPE_LABELS;
const LEAVE_TYPE_ICONS: Record<string, string> = STUDENT_LEAVE_TYPE_ICONS;

const STATUS_STYLES: Record<LeaveStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<LeaveStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const STATUS_ICONS: Record<LeaveStatus, string> = {
  PENDING: "⏳",
  APPROVED: "✅",
  REJECTED: "❌",
};

const formatDateLong = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const calcDays = (s: string, e: string) =>
  Math.max(
    1,
    Math.ceil(
      (new Date(e).getTime() - new Date(s).getTime()) / (1000 * 60 * 60 * 24),
    ) + 1,
  );

const StudentLeaveRequestCard = ({
  request,
}: {
  request: TStudentLeaveRequest;
}) => {
  const label = LEAVE_TYPE_LABELS[request.leave_type] ?? request.leave_type;
  const icon = LEAVE_TYPE_ICONS[request.leave_type] ?? "📋";
  const statusStyle = STATUS_STYLES[request.status];
  const statusLabel = STATUS_LABELS[request.status];
  const statusIcon = STATUS_ICONS[request.status];

  return (
    <div className="px-6 py-5 hover:bg-gray-50 transition-colors duration-150 group">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-blue-600">
              {new Date(request.start_date).getDate()}
            </span>
            <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
              {new Date(request.start_date).toLocaleDateString("en-US", {
                month: "short",
              })}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 truncate">{label}</h3>
              <span className="text-lg">{icon}</span>
            </div>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <FaCalendar className="w-3.5 h-3.5 text-gray-400" />
                <span>
                  {formatDateLong(request.start_date)} -{" "}
                  {formatDateLong(request.end_date)}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <FaClock className="w-3.5 h-3.5 text-gray-400" />
                <span>
                  {calcDays(request.start_date, request.end_date)} day(s)
                </span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium ${statusStyle}`}
          >
            <span>{statusIcon}</span>
            <span>{statusLabel}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-start gap-3">
          <FaFileLines className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-600 line-clamp-2 flex-1">
            {request.reason || "No reason provided"}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
        <span>
          Applied{" "}
          {new Date(request.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
        <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
        <span className="capitalize">{request.status.toLowerCase()}</span>
      </div>
    </div>
  );
};

export default StudentLeaveRequestCard;
