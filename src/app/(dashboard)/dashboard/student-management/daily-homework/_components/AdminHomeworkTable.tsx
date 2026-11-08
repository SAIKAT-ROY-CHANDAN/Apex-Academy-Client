"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { deleteHomework } from "@/services/homework";
import { THomework } from "@/types/modules/teacher/homework.type";
import {
  Trash2,
  ChevronLeft,
  ChevronRight,
  NotebookPen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface AdminHomeworkTableProps {
  homeworks: THomework[];
  currentPage: number;
  totalItems: number;
  totalPages?: number;
  loading?: boolean;
}

const PAGE_SIZE = 10;

const AdminHomeworkTable = ({
  homeworks,
  currentPage,
  totalItems,
  totalPages,
  loading = false,
}: AdminHomeworkTableProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [homeworkToDelete, setHomeworkToDelete] = useState<THomework | null>(null);

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const canGoNext = totalPages ? currentPage < totalPages : homeworks.length === PAGE_SIZE;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
  };

  const handleDeleteClick = (homework: THomework) => {
    setHomeworkToDelete(homework);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!homeworkToDelete) return;

    startTransition(async () => {
      const response = await deleteHomework(homeworkToDelete.id);

      if (!response.success) {
        toast.error(response.message ?? "Failed to delete homework");
        return;
      }
      toast.success(response.message ?? "Homework deleted successfully");
      setDeleteDialogOpen(false);
      setHomeworkToDelete(null);
      router.refresh();
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (dueDate: string) => {
    if (!dueDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    const isOverdue = due < today;
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
          isOverdue
            ? "bg-red-50 text-red-700"
            : "bg-emerald-50 text-emerald-700"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            isOverdue ? "bg-red-500" : "bg-emerald-500"
          }`}
        />
        {isOverdue ? "Overdue" : "Pending"}
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
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-8 w-16" /></TableCell>
      </TableRow>
    ));
  };

  return (
    <>
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="text-lg font-semibold">Homework List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Title
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Description
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Class/Year
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Section
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Subject
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Teacher
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Due Date
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Created At
                  </TableHead>
                  <TableHead className="h-10 w-24 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderLoadingRows()}</TableBody>
            </Table>
          ) : homeworks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <NotebookPen className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                No homework found.
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                No homework matches the selected filters.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Title
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Description
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Class/Year
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Section
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Subject
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Teacher
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Due Date
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Created At
                    </TableHead>
                    <TableHead className="h-10 w-24 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {homeworks.map((homework) => (
                    <TableRow
                      key={homework.id}
                      className="group transition-colors hover:bg-muted/20"
                    >
                      <TableCell className="font-medium">
                        {homework.title}
                      </TableCell>
                      <TableCell className="max-w-48 text-xs text-muted-foreground">
                        <span title={homework.description}>
                          {truncate(homework.description)}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {homework.academicClass?.class_name ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {homework.academicSection?.section_name ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {homework.subject?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {homework.teacher?.full_name ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="flex flex-col gap-1">
                          <span>{formatDate(homework.due_date)}</span>
                          {getStatusBadge(homework.due_date)}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDateTime(homework.created_at)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:text-destructive hover:opacity-100"
                            onClick={() => handleDeleteClick(homework)}
                            title="Delete homework"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, totalItems)}–
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

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Homework"
        description={
          homeworkToDelete
            ? `Are you sure you want to delete "${homeworkToDelete.title}"? This action cannot be undone.`
            : "Are you sure you want to delete this homework? This action cannot be undone."
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

export default AdminHomeworkTable;
