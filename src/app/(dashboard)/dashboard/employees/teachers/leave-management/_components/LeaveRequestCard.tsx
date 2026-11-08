"use client";

import { CalendarDays, Check, Clock, Eye, Phone, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { updateTeacherLeaveRequestStatus } from "@/services/teacherLeave";
import {
  LeaveStatus,
  type TLeaveRequest,
} from "@/types/modules/teacher/leave-request.type";
import {
  formatDate,
  getInitials,
  getLeaveDays,
  LEAVE_TYPE_ICONS,
  LEAVE_TYPE_LABELS,
  STATUS_BADGE_STYLES,
  STATUS_ICONS,
  STATUS_LABELS,
} from "../_constants";

type LeaveRequestCardProps = {
  request: TLeaveRequest;
  detailHref?: string;
};

const LeaveRequestCard = ({ request, detailHref }: LeaveRequestCardProps) => {
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
  const days = getLeaveDays(request.leave_start_date, request.leave_end_date);

  const viewHref =
    detailHref ??
    `/dashboard/employees/teachers/leave-management/${request.id}`;

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

  return (
    <>
      <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm transition-all duration-200 hover:border-border hover:shadow-md">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
          {/* Teacher identity */}
          <div className="flex shrink-0 items-center gap-3 lg:w-60">
            <Avatar className="h-11 w-11">
              <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                {getInitials(teacher?.full_name ?? "TE")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">
                {teacher?.full_name ?? "Unknown Teacher"}
              </p>
              {(teacher?.designation?.name ||
                teacher?.department?.department_name) && (
                <p className="mt-0.5 text-xs text-muted-foreground truncate">
                  {[
                    teacher?.designation?.name,
                    teacher?.department?.department_name,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              )}
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span className="truncate">{teacher?.phone ?? "—"}</span>
              </p>
            </div>
          </div>

          {/* Leave info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-lg leading-none">{leaveTypeIcon}</span>
              <p className="font-semibold text-foreground">{leaveTypeLabel}</p>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                {formatDate(request.leave_start_date)} —{" "}
                {formatDate(request.leave_end_date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                {days} day{days > 1 ? "s" : ""}
              </span>
            </div>

            <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">
              {request.leave_application || "No reason provided"}
            </p>
          </div>

          {/* Status + actions */}
          <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium capitalize ${statusStyle}`}
            >
              <span>{statusIcon}</span>
              {statusLabel.toLowerCase()}
            </span>

            <div className="flex items-center gap-2">
              <Link href={viewHref}>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </Button>
              </Link>

              {!isResolved && (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-1.5"
                    disabled={isPending}
                    onClick={() => setConfirmAction(LeaveStatus.APPROVED)}
                  >
                    <Check className="h-3.5 w-3.5" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-1.5"
                    disabled={isPending}
                    onClick={() => setConfirmAction(LeaveStatus.REJECTED)}
                  >
                    <X className="h-3.5 w-3.5" />
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

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
            ? `Are you sure you want to approve this ${leaveTypeLabel.toLowerCase()} request for ${teacher?.full_name ?? "the teacher"}?`
            : `Are you sure you want to reject this ${leaveTypeLabel.toLowerCase()} request for ${teacher?.full_name ?? "the teacher"}?`
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

export default LeaveRequestCard;
