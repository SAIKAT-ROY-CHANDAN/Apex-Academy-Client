"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { updateTeacherLeaveRequestStatus } from "@/services/teacherLeave";
import { formatTeacherType } from "@/constant/teacher/teacherType";
import {
  LeaveStatus,
  TLeaveRequest,
} from "@/types/modules/teacher/leave-request.type";
import {
  CalendarDays,
  Check,
  Clock,
  Eye,
  FileText,
  History,
  Mail,
  Phone,
  Undo2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  ADMINISTRATIVE_POSITION_LABELS,
  formatDate,
  formatDateLong,
  getInitials,
  getLeaveDays,
  LEAVE_TYPE_ICONS,
  LEAVE_TYPE_LABELS,
  STATUS_BADGE_STYLES,
  STATUS_ICONS,
  STATUS_LABELS,
} from "../../_constants";

type LeaveRequestDetailsProps = {
  request: TLeaveRequest;
};

const LeaveRequestDetails = ({ request }: LeaveRequestDetailsProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmAction, setConfirmAction] = useState<
    LeaveStatus.APPROVED | LeaveStatus.REJECTED | null
  >(null);

  const isResolved = request.leave_status !== LeaveStatus.PENDING;
  const teacher = request.teacher;

  const leaveTypeLabel =
    LEAVE_TYPE_LABELS[request.leave_type] ?? request.leave_type;
  const leaveTypeIcon = LEAVE_TYPE_ICONS[request.leave_type] ?? "📋";
  const statusStyle = STATUS_BADGE_STYLES[request.leave_status];
  const statusLabel = STATUS_LABELS[request.leave_status];
  const statusIcon = STATUS_ICONS[request.leave_status];
  const days = getLeaveDays(
    request.leave_start_date,
    request.leave_end_date,
  );
  const otherRequests = request.otherRequests ?? [];

  const handleConfirm = () => {
    if (!confirmAction) return;

    startTransition(async () => {
      const response = await updateTeacherLeaveRequestStatus(
        request.id,
        confirmAction,
      );
      setConfirmAction(null);

      if (response?.success) {
        toast.success(
          response.message ??
            `Leave request ${
              confirmAction === LeaveStatus.APPROVED ? "approved" : "rejected"
            } successfully`,
        );
        router.refresh();
      } else {
        toast.error(
          response?.message ?? "Failed to update leave request status",
        );
      }
    });
  };

  const infoItems = [
    {
      label: "Leave Type",
      value: (
        <span className="inline-flex items-center gap-2">
          <span className="text-base">{leaveTypeIcon}</span>
          {leaveTypeLabel}
        </span>
      ),
    },
    { label: "Start Date", value: formatDateLong(request.leave_start_date) },
    { label: "End Date", value: formatDateLong(request.leave_end_date) },
    { label: "Duration", value: `${days} day${days > 1 ? "s" : ""}` },
    {
      label: "Submitted",
      value: request.created_at
        ? new Date(request.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "—",
    },
    {
      label: "Teacher Type",
      value: teacher?.teacher_type
        ? formatTeacherType(teacher.teacher_type)
        : "—",
    },
    {
      label: "Administrative Position",
      value: teacher?.administrative_position
        ? (ADMINISTRATIVE_POSITION_LABELS[
            teacher.administrative_position
          ] ?? teacher.administrative_position)
        : "—",
    },
    {
      label: "Designation",
      value: teacher?.designation?.name ?? "—",
    },
    {
      label: "Department",
      value: teacher?.department?.department_name ?? "—",
    },
    {
      label: "Shift",
      value: teacher?.shift?.name ?? "—",
    },
  ];

  return (
    <>
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex flex-col gap-5 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                {teacher?.photo && <AvatarImage src={teacher.photo} />}
                <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
                  {getInitials(teacher?.full_name ?? "TE")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {teacher?.full_name ?? "Unknown Teacher"}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    {teacher?.phone ?? "—"}
                  </span>
                  {teacher?.email && (
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      {teacher.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <span
              className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium capitalize ${statusStyle}`}
            >
              <span>{statusIcon}</span>
              {statusLabel.toLowerCase()}
            </span>
          </div>

          {/* Info grid */}
          <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {infoItems.map((item) => (
              <div key={item.label}>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-1.5 text-sm font-medium text-foreground">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Application */}
          <div className="mt-6 rounded-lg border bg-muted/30 p-5">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Leave Application
              </h3>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {request.leave_application || "No reason provided"}
            </p>
          </div>

          {/* Other leave requests by this teacher */}
          {otherRequests.length > 0 && (
            <div className="mt-6 rounded-lg border p-5">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  Other Leave Requests
                </h3>
                <span className="text-xs text-muted-foreground">
                  (last {otherRequests.length})
                </span>
              </div>
              <ul className="mt-3 divide-y">
                {otherRequests.map((other) => {
                  const otherLabel =
                    LEAVE_TYPE_LABELS[other.leave_type] ?? other.leave_type;
                  const otherIcon = LEAVE_TYPE_ICONS[other.leave_type] ?? "📋";
                  return (
                    <li
                      key={other.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-2.5"
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <span>{otherIcon}</span>
                        <span className="font-medium">{otherLabel}</span>
                        <span className="text-muted-foreground">
                          {formatDate(other.leave_start_date)} →{" "}
                          {formatDate(other.leave_end_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                            STATUS_BADGE_STYLES[other.leave_status]
                          }`}
                        >
                          <span>{STATUS_ICONS[other.leave_status]}</span>
                          {STATUS_LABELS[other.leave_status]}
                        </span>
                        <Link
                          href={`/dashboard/employees/teachers/leave-management/${other.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="outline"
              size="lg"
              className="gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => router.back()}
              disabled={isPending}
            >
              <Undo2 className="h-4 w-4" />
              Back
            </Button>

            {!isResolved ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="destructive"
                  size="lg"
                  className="gap-2"
                  disabled={isPending}
                  onClick={() => setConfirmAction(LeaveStatus.REJECTED)}
                >
                  <X className="h-4 w-4" />
                  Reject Request
                </Button>
                <Button
                  variant="default"
                  size="lg"
                  className="gap-2"
                  disabled={isPending}
                  onClick={() => setConfirmAction(LeaveStatus.APPROVED)}
                >
                  <Check className="h-4 w-4" />
                  Approve Request
                </Button>
              </div>
            ) : (
              <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                This request has already been{" "}
                {statusLabel.toLowerCase()}.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
        title={
          confirmAction === LeaveStatus.APPROVED
            ? "Approve Leave Request"
            : "Reject Leave Request"
        }
        description={
          confirmAction === LeaveStatus.APPROVED
            ? `Are you sure you want to approve this ${leaveTypeLabel.toLowerCase()} request for ${
                teacher?.full_name ?? "the teacher"
              }?`
            : `Are you sure you want to reject this ${leaveTypeLabel.toLowerCase()} request for ${
                teacher?.full_name ?? "the teacher"
              }?`
        }
        confirmLabel={
          confirmAction === LeaveStatus.APPROVED ? "Approve" : "Reject"
        }
        variant={
          confirmAction === LeaveStatus.REJECTED ? "destructive" : "default"
        }
        isPending={isPending}
        onConfirm={handleConfirm}
      />
    </>
  );
};

export default LeaveRequestDetails;
