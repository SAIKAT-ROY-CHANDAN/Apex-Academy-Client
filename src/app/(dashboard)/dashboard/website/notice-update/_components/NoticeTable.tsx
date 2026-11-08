"use client";

import { Edit, Eye, FileText, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteAcademicNotice } from "@/services/academicNotice";

export interface NoticeItem {
  id: string;
  title: string;
  noticeType: string;
  pdfUrl?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface NoticeTableProps {
  notices: NoticeItem[];
}

const noticeTypeLabel = (value: string) =>
  value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const NoticeTable = ({ notices }: NoticeTableProps) => {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<NoticeItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDeleteClick = (notice: NoticeItem) => {
    setToDelete(notice);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!toDelete) return;

    startTransition(async () => {
      const response = await deleteAcademicNotice(toDelete.id);

      if (!response.success) {
        toast.error(response.message ?? "Failed to delete notice");
        return;
      }
      toast.success(response.message ?? "Notice deleted successfully");
      setDeleteDialogOpen(false);
      setToDelete(null);
      router.refresh();
    });
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {notices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              No notices found.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Try adjusting the filters or add a new notice.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-50/70 hover:bg-blue-50/70">
                <TableHead className="h-12 w-16 text-center text-sm font-semibold text-slate-700">
                  No.
                </TableHead>
                <TableHead className="h-12 text-sm font-semibold text-slate-700">
                  Title
                </TableHead>
                <TableHead className="h-12 text-center text-sm font-semibold text-slate-700">
                  Type
                </TableHead>
                <TableHead className="h-12 text-center text-sm font-semibold text-slate-700">
                  PDF
                </TableHead>
                <TableHead className="h-12 text-center text-sm font-semibold text-slate-700">
                  Created At
                </TableHead>
                <TableHead className="h-12 w-32 text-center text-sm font-semibold text-slate-700">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notices.map((notice, index) => (
                <TableRow
                  key={notice.id}
                  className="border-slate-100 hover:bg-slate-50/60"
                >
                  <TableCell className="text-center text-sm text-slate-600">
                    {(index + 1).toString().padStart(2, "0")}
                  </TableCell>
                  <TableCell className="max-w-[360px]">
                    <span
                      className="text-sm font-medium text-slate-800 truncate block"
                      title={notice.title}
                    >
                      {notice.title}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                      {noticeTypeLabel(notice.noticeType)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {notice.pdfUrl ? (
                      <a
                        href={notice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </a>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-sm text-slate-600">
                    {notice.created_at
                      ? new Date(notice.created_at).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      {notice.pdfUrl && (
                        <a
                          href={notice.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100"
                          title="View PDF"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                      )}
                      <Link
                        href={`/dashboard/website/notice-update/${notice.id}/edit`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-blue-600 transition hover:bg-blue-50"
                        title="Edit notice"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(notice)}
                        disabled={isPending}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        title="Delete notice"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Notice"
        description={
          toDelete
            ? `Are you sure you want to delete "${toDelete.title}"? This action cannot be undone.`
            : "Are you sure you want to delete this notice? This action cannot be undone."
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

export default NoticeTable;
