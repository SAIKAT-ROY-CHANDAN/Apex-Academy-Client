"use client";

import {
  Briefcase,
  Check,
  Clock,
  Edit,
  FileText,
  Phone,
  Undo2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { updateStaffLeave } from "@/services/staffLeave";
import {
  LeaveStatus,
  type TStaffLeave,
} from "@/types/modules/staff/staff-leave.type";
import {
  formatDateLong,
  getInitials,
  getLeaveDays,
  LEAVE_TYPE_ICONS,
  LEAVE_TYPE_LABELS,
  STATUS_BADGE_STYLES,
  STATUS_ICONS,
  STATUS_LABELS,
} from "../_constants";

type StaffLeaveDetailsProps = {
  leave: TStaffLeave;
};

const StaffLeaveDetails = ({ leave }: StaffLeaveDetailsProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmAction, setConfirmAction] = useState<
    LeaveStatus.APPROVED | LeaveStatus.REJECTED | null
  >(null);

  const isResolved = leave.leave_status !== LeaveStatus.PENDING;
  const staff = leave.staff;
  const designationName = staff?.designation?.name ?? null;

  const leaveTypeLabel =
    LEAVE_TYPE_LABELS[leave.leave_type] ?? leave.leave_type;
  const leaveTypeIcon = LEAVE_TYPE_ICONS[leave.leave_type] ?? "📋";
  const statusStyle = STATUS_BADGE_STYLES[leave.leave_status] ?? "";
  const statusIcon = STATUS_ICONS[leave.leave_status] ?? "";
  const statusLabel = STATUS_LABELS[leave.leave_status] ?? leave.leave_status;
  const days = getLeaveDays(leave.leave_start_date, leave.leave_end_date);

  const handleConfirm = () => {
    if (!confirmAction) return;

    startTransition(async () => {
      const response = await updateStaffLeave(leave.id, {
        leave_status: confirmAction,
      });
      setConfirmAction(null);

      if (response?.success) {
        toast.success(
          response.message ??
            `Leave ${
              confirmAction === LeaveStatus.APPROVED ? "approved" : "rejected"
            } successfully`,
        );
        router.refresh();
      } else {
        toast.error(response?.message ?? "Failed to update leave status");
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
    { label: "Start Date", value: formatDateLong(leave.leave_start_date) },
    { label: "End Date", value: formatDateLong(leave.leave_end_date) },
    { label: "Duration", value: `${days} day${days > 1 ? "s" : ""}` },
    {
      label: "Submitted",
      value: leave.created_at
        ? new Date(leave.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "—",
    },
  ];

  return (
    <>
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-6">
          {/* Staff identity */}
          <div className="flex flex-col gap-5 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                  {getInitials(staff?.full_name ?? "ST")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {staff?.full_name ?? "Unknown Staff"}
                </h2>
                {staff?.phone && (
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {staff.phone}
                  </p>
                )}
                {designationName && (
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    {designationName}
                  </p>
                )}
              </div>
            </div>

            <span
              className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium capitalize ${statusStyle}`}
            >
              <span>{statusIcon}</span>
              {statusLabel.toLowerCase()}
            </span>
          </div>

          {/* Info grid */}
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {infoItems.map((item) => (
              <div key={item.label} className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-sm font-medium text-foreground">
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
              {leave.leave_application || "No reason provided"}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row">
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

              <Link
                href={`/dashboard/employees/staffs/leave-management/${leave.id}/edit`}
              >
                <Button variant="outline" size="lg" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
            </div>

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
                  Reject Leave
                </Button>
                <Button
                  variant="default"
                  size="lg"
                  className="gap-2"
                  disabled={isPending}
                  onClick={() => setConfirmAction(LeaveStatus.APPROVED)}
                >
                  <Check className="h-4 w-4" />
                  Approve Leave
                </Button>
              </div>
            ) : (
              <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                This leave has already been {statusLabel.toLowerCase()}.
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
            ? "Approve Leave"
            : "Reject Leave"
        }
        description={
          confirmAction === LeaveStatus.APPROVED
            ? `Are you sure you want to approve this ${leaveTypeLabel.toLowerCase()} for ${
                staff?.full_name ?? "this staff"
              }?`
            : `Are you sure you want to reject this ${leaveTypeLabel.toLowerCase()} for ${
                staff?.full_name ?? "this staff"
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

export default StaffLeaveDetails;
