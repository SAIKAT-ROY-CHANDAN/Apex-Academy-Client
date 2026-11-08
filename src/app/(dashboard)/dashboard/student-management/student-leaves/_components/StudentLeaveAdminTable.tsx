"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { STUDENT_LEAVE_TYPE_LABELS } from "@/constant/leave/studentLeaveType";
import {
  deleteStudentLeaveRequest,
  updateStudentLeaveStatus,
} from "@/services/studentLeave";
import {
  LeaveStatus,
  type LeaveType,
  type TStudentLeaveRequest,
} from "@/types/modules/student/leave-request.type";

const TYPE_LABEL: Record<string, string> = STUDENT_LEAVE_TYPE_LABELS;

const STATUS_VARIANT: Record<LeaveStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

const formatDate = (s: string) =>
  new Date(s).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const calcDays = (s: string, e: string) =>
  Math.max(
    1,
    Math.ceil((new Date(e).getTime() - new Date(s).getTime()) / 86400000) + 1,
  );

const PAGE_SIZE = 10;

// Prefer the current (primary) enrollment — a promoted student owns closed
// history rows too. Falls back to [0] for payloads without the flag.
const getEnrollment = (leave: TStudentLeaveRequest) => {
  const enrollments = leave.student.studentEnrollments ?? [];
  return enrollments.find((e) => e.is_primary) ?? enrollments[0];
};

type Props = {
  leaves: TStudentLeaveRequest[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
};

const StudentLeaveAdminTable = ({
  leaves,
  currentPage,
  totalItems,
  totalPages,
}: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<TStudentLeaveRequest | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    status: LeaveStatus;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TStudentLeaveRequest | null>(
    null,
  );
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleStatus = (id: string, status: LeaveStatus) => {
    setConfirmAction({ id, status });
    setConfirmOpen(true);
  };

  const confirmStatus = () => {
    if (!confirmAction) return;
    startTransition(async () => {
      const res = await updateStudentLeaveStatus(
        confirmAction.id,
        confirmAction.status,
      );
      if (res?.success) {
        toast.success(
          res.message ||
            `Leave ${confirmAction.status.toLowerCase()} successfully`,
        );
        setConfirmOpen(false);
        router.refresh();
      } else {
        toast.error(res?.message || "Failed to update status");
      }
    });
  };

  const handleDelete = (leave: TStudentLeaveRequest) => {
    setDeleteTarget(leave);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const res = await deleteStudentLeaveRequest(deleteTarget.id);
      if (res?.success) {
        toast.success(res.message || "Leave deleted");
        setDeleteOpen(false);
        setDeleteTarget(null);
        router.refresh();
      } else {
        toast.error(res?.message || "Failed to delete");
      }
    });
  };

  const handlePage = (p: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(p));
    router.push(`?${params.toString()}`);
  };

  const openDetail = (leave: TStudentLeaveRequest) => {
    setSelected(leave);
    setDetailOpen(true);
  };

  if (leaves.length === 0) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardContent className="py-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            📋
          </div>
          <p className="text-sm font-medium">No leave requests found</p>
          <p className="text-xs text-muted-foreground mt-1">
            No requests match the current filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">
            Student Leave Requests
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–
            {Math.min(currentPage * PAGE_SIZE, totalItems)} of {totalItems}
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Student
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Class / Section
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Leave Type
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Period
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Days
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Reason
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.map((l) => {
                  const enrollment = getEnrollment(l);
                  const className =
                    enrollment?.academicClass?.class_name ?? "—";
                  const sectionName =
                    enrollment?.academicSection?.section_name ?? "—";
                  return (
                    <TableRow key={l.id} className="hover:bg-muted/20">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border">
                            <AvatarImage
                              src={l.student.photo ?? undefined}
                              alt={l.student.name}
                            />
                            <AvatarFallback className="text-[11px]">
                              {l.student.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {l.student.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {l.student.email ??
                                l.student.student_phone ??
                                "—"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {className}
                          </span>
                          <span className="text-[11px]">
                            {sectionName !== "—" ? `Sec: ${sectionName}` : "—"}{" "}
                            • Roll: {enrollment?.roll_number ?? "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-xs font-medium"
                        >
                          {TYPE_LABEL[l.leave_type] ?? l.leave_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(l.start_date)} → {formatDate(l.end_date)}
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {calcDays(l.start_date, l.end_date)}
                      </TableCell>
                      <TableCell className="max-w-[220px]">
                        <p
                          className="truncate text-xs text-muted-foreground"
                          title={l.reason}
                        >
                          {l.reason}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_VARIANT[l.status]}`}
                        >
                          {l.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openDetail(l)}
                            title="View"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {l.status === LeaveStatus.PENDING && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() =>
                                  handleStatus(l.id, LeaveStatus.APPROVED)
                                }
                                disabled={isPending}
                                title="Approve"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() =>
                                  handleStatus(l.id, LeaveStatus.REJECTED)
                                }
                                disabled={isPending}
                                title="Reject"
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(l)}
                            disabled={isPending}
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Page {currentPage} of {totalPages || 1} • {totalItems} total
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage <= 1}
                onClick={() => handlePage(currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage >= totalPages}
                onClick={() => handlePage(currentPage + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Leave Request Detail</DialogTitle>
            <DialogDescription className="text-xs">
              Review complete leave information before taking action.
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border p-3 bg-muted/20">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selected.student.photo ?? undefined} />
                  <AvatarFallback>
                    {selected.student.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">
                    {selected.student.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selected.student.email} •{" "}
                    {selected.student.student_phone ?? "—"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {getEnrollment(selected)?.academicClass?.class_name ?? "—"}{" "}
                    •{" "}
                    {getEnrollment(selected)?.academicSection?.section_name ??
                      "—"}{" "}
                    • Roll {getEnrollment(selected)?.roll_number ?? "—"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Leave Type</p>
                  <p className="font-medium">
                    {TYPE_LABEL[selected.leave_type] ?? selected.leave_type}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_VARIANT[selected.status]}`}
                  >
                    {selected.status}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <p className="font-medium">
                    {formatDate(selected.start_date)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">End Date</p>
                  <p className="font-medium">{formatDate(selected.end_date)}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-medium">
                    {calcDays(selected.start_date, selected.end_date)} day(s)
                  </p>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-xs text-muted-foreground">Reason</p>
                  <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 border">
                    {selected.reason}
                  </p>
                </div>
                <div className="col-span-2 text-[11px] text-muted-foreground">
                  Applied on {formatDate(selected.created_at)} • Updated{" "}
                  {formatDate(selected.updated_at)}
                </div>
              </div>
              {selected.status === LeaveStatus.PENDING && (
                <div className="flex gap-2 pt-2">
                  <Button
                    disabled={isPending}
                    onClick={() => {
                      handleStatus(selected.id, LeaveStatus.APPROVED);
                      setDetailOpen(false);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-1" />
                    )}{" "}
                    Approve
                  </Button>
                  <Button
                    disabled={isPending}
                    variant="destructive"
                    onClick={() => {
                      handleStatus(selected.id, LeaveStatus.REJECTED);
                      setDetailOpen(false);
                    }}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-1" /> Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={
          confirmAction?.status === LeaveStatus.APPROVED
            ? "Approve Leave?"
            : "Reject Leave?"
        }
        description={
          confirmAction?.status === LeaveStatus.APPROVED
            ? "Are you sure you want to approve this leave request?"
            : "Are you sure you want to reject this leave request?"
        }
        confirmLabel={
          confirmAction?.status === LeaveStatus.APPROVED ? "Approve" : "Reject"
        }
        variant={
          confirmAction?.status === LeaveStatus.APPROVED
            ? "default"
            : "destructive"
        }
        isPending={isPending}
        onConfirm={confirmStatus}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Leave Request?"
        description={`Delete leave request for ${deleteTarget?.student.name ?? "this student"}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        isPending={isPending}
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default StudentLeaveAdminTable;
