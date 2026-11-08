"use client";

import { CalendarX2, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LEAVE_TYPE_LABELS as canonicalLeaveTypeLabels } from "@/constant/leave/leaveType";
import {
  LeaveStatus,
  type TLeaveRequest,
} from "@/types/modules/teacher/leave-request.type";

interface LeaveRequestTableProps {
  requests: TLeaveRequest[];
  currentPage: number;
  totalItems: number;
  totalPages?: number;
  loading?: boolean;
}

const PAGE_SIZE = 10;

const LEAVE_TYPE_LABELS: Record<string, string> = canonicalLeaveTypeLabels;

const STATUS_STYLES: Record<LeaveStatus, string> = {
  [LeaveStatus.PENDING]: "bg-amber-50 text-amber-700",
  [LeaveStatus.APPROVED]: "bg-emerald-50 text-emerald-700",
  [LeaveStatus.REJECTED]: "bg-red-50 text-red-700",
};

const STATUS_DOT_STYLES: Record<LeaveStatus, string> = {
  [LeaveStatus.PENDING]: "bg-amber-500",
  [LeaveStatus.APPROVED]: "bg-emerald-500",
  [LeaveStatus.REJECTED]: "bg-red-500",
};

const STATUS_LABELS: Record<LeaveStatus, string> = {
  [LeaveStatus.PENDING]: "Pending",
  [LeaveStatus.APPROVED]: "Approved",
  [LeaveStatus.REJECTED]: "Rejected",
};

const LeaveRequestTable = ({
  requests,
  currentPage,
  totalItems,
  totalPages,
  loading = false,
}: LeaveRequestTableProps) => {
  const router = useRouter();

  const canGoNext = totalPages
    ? currentPage < totalPages
    : requests.length === PAGE_SIZE;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDayCount = (start: string, end: string) => {
    if (!start || !end) return "—";
    const days =
      Math.ceil(
        (new Date(end).getTime() - new Date(start).getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1;
    return `${days} day${days === 1 ? "" : "s"}`;
  };

  const getStatusBadge = (status: LeaveStatus) => {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? "bg-muted text-muted-foreground"}`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT_STYLES[status] ?? "bg-muted-foreground"}`}
        />
        {STATUS_LABELS[status] ?? status}
      </span>
    );
  };

  const truncate = (text: string, maxLength = 80) => {
    if (!text) return "—";
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  const renderLoadingRows = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={index}>
        <TableCell>
          <Skeleton className="h-4 w-28" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-48" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-24" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-24" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-16" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-20" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-24" />
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
        <CardTitle className="text-lg font-semibold">Leave Requests</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Leave Type
                </TableHead>
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Application
                </TableHead>
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Start Date
                </TableHead>
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  End Date
                </TableHead>
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Duration
                </TableHead>
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Applied On
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{renderLoadingRows()}</TableBody>
          </Table>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarX2 className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              No leave requests found.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Apply for leave to get started.
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Leave Type
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Application
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Start Date
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    End Date
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Duration
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Applied On
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow
                    key={request.id}
                    className="group transition-colors hover:bg-muted/20"
                  >
                    <TableCell className="font-medium">
                      {LEAVE_TYPE_LABELS[request.leave_type] ??
                        request.leave_type}
                    </TableCell>
                    <TableCell className="max-w-48 text-xs text-muted-foreground">
                      <span title={request.leave_application}>
                        {truncate(request.leave_application)}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(request.leave_start_date)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(request.leave_end_date)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {getDayCount(
                        request.leave_start_date,
                        request.leave_end_date,
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(request.leave_status)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(request.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                {Math.min((currentPage - 1) * PAGE_SIZE + 1, totalItems)}–
                {Math.min(currentPage * PAGE_SIZE, totalItems)} of {totalItems}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-2 text-xs text-muted-foreground">
                  Page {currentPage}
                  {totalPages ? ` of ${totalPages}` : ""}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={!canGoNext}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaveRequestTable;
