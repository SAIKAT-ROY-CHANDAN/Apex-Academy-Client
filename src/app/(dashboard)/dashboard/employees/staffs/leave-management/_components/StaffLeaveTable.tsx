"use client";

import {
  CalendarDays,
  Clock,
  Edit,
  Eye,
  Phone,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteStaffLeave } from "@/services/staffLeave";
import type { TStaffLeave } from "@/types/modules/staff/staff-leave.type";
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

type StaffLeaveTableProps = {
  leaves: TStaffLeave[];
};

const StaffLeaveTable = ({ leaves }: StaffLeaveTableProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState<TStaffLeave | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDeleteClick = (leave: TStaffLeave) => {
    setLeaveToDelete(leave);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!leaveToDelete) return;

    startTransition(async () => {
      const response = await deleteStaffLeave(leaveToDelete.id);

      if (!response.success) {
        toast.error(response.message ?? "Failed to delete leave record");
        return;
      }
      toast.success(response.message ?? "Leave record deleted successfully");
      setDeleteDialogOpen(false);
      setLeaveToDelete(null);
      router.refresh();
    });
  };

  return (
    <>
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="text-lg font-semibold">Staff Leaves</CardTitle>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {leaves.length} record{leaves.length > 1 ? "s" : ""}
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {!leaves || leaves.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                No leave records found.
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Try adjusting the filters or add a new leave record.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="h-10 w-12 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    SN
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Staff
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Designation
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Leave Type
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Duration
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Application
                  </TableHead>
                  <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.map((leave, index) => {
                  const leaveTypeLabel =
                    LEAVE_TYPE_LABELS[leave.leave_type] ?? leave.leave_type;
                  const leaveTypeIcon =
                    LEAVE_TYPE_ICONS[leave.leave_type] ?? "📋";
                  const statusStyle =
                    STATUS_BADGE_STYLES[leave.leave_status] ?? "";
                  const statusIcon = STATUS_ICONS[leave.leave_status] ?? "";
                  const statusLabel =
                    STATUS_LABELS[leave.leave_status] ?? leave.leave_status;
                  const days = getLeaveDays(
                    leave.leave_start_date,
                    leave.leave_end_date,
                  );

                  return (
                    <TableRow key={leave.id} className="hover:bg-muted/40">
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                              {getInitials(leave.staff?.full_name ?? "ST")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <span className="block truncate text-sm font-medium text-foreground">
                              {leave.staff?.full_name ?? "Unknown Staff"}
                            </span>
                            {leave.staff?.phone && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {leave.staff.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {leave.staff?.designation?.name ?? "N/A"}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                          <span>{leaveTypeIcon}</span>
                          {leaveTypeLabel}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatDate(leave.leave_start_date)} —{" "}
                            {formatDate(leave.leave_end_date)}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {days} day{days > 1 ? "s" : ""}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium capitalize ${statusStyle}`}
                        >
                          <span>{statusIcon}</span>
                          {statusLabel.toLowerCase()}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="truncate text-sm text-muted-foreground">
                          {leave.leave_application || "—"}
                        </p>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            href={`/dashboard/employees/staffs/leave-management/${leave.id}`}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:opacity-100"
                              title="View leave"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>

                          <Link
                            href={`/dashboard/employees/staffs/leave-management/${leave.id}/edit`}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:opacity-100"
                              title="Edit leave"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:text-destructive hover:opacity-100"
                            onClick={() => handleDeleteClick(leave)}
                            title="Delete leave"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Leave Record"
        description={
          leaveToDelete
            ? `Are you sure you want to delete the ${
                LEAVE_TYPE_LABELS[leaveToDelete.leave_type] ??
                leaveToDelete.leave_type
              } for ${
                leaveToDelete.staff?.full_name ?? "this staff"
              }? This action cannot be undone.`
            : "Are you sure you want to delete this leave record? This action cannot be undone."
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isPending={isPending}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default StaffLeaveTable;
