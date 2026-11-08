"use client";

import { Banknote, Edit, Eye, Trash2 } from "lucide-react";
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
import { deleteAcademicTuition } from "@/services/academicTuition";

export interface TuitionItem {
  id: string;
  title: string;
  tuitionUrl?: string | null;
  tuitionAmount?: number | null;
  created_at?: string;
  updated_at?: string;
}

interface TuitionTableProps {
  tuitions: TuitionItem[];
}

const TuitionTable = ({ tuitions }: TuitionTableProps) => {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<TuitionItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDeleteClick = (tuition: TuitionItem) => {
    setToDelete(tuition);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!toDelete) return;

    startTransition(async () => {
      const response = await deleteAcademicTuition(toDelete.id);

      if (!response.success) {
        toast.error(response.message ?? "Failed to delete tuition");
        return;
      }
      toast.success(response.message ?? "Tuition deleted successfully");
      setDeleteDialogOpen(false);
      setToDelete(null);
      router.refresh();
    });
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {tuitions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Banknote className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              No tuitions found.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Try adjusting the search or add a new tuition.
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
                <TableHead className="h-12 w-32 text-center text-sm font-semibold text-slate-700">
                  Image
                </TableHead>
                <TableHead className="h-12 w-32 text-center text-sm font-semibold text-slate-700">
                  Amount
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
              {tuitions.map((tuition, index) => (
                <TableRow
                  key={tuition.id}
                  className="border-slate-100 hover:bg-slate-50/60"
                >
                  <TableCell className="text-center text-sm text-slate-600">
                    {(index + 1).toString().padStart(2, "0")}
                  </TableCell>
                  <TableCell className="max-w-[320px]">
                    <span
                      className="block truncate text-sm font-medium text-slate-800"
                      title={tuition.title}
                    >
                      {tuition.title}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {tuition.tuitionUrl ? (
                      <a
                        href={tuition.tuitionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex justify-center"
                      >
                        {/* biome-ignore lint/performance/noImgElement: external image url */}
                        <img
                          src={tuition.tuitionUrl}
                          alt={tuition.title}
                          className="h-10 w-16 rounded-md object-cover border border-slate-200"
                        />
                      </a>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-sm text-slate-600">
                    {tuition.tuitionAmount != null
                      ? tuition.tuitionAmount.toLocaleString()
                      : "—"}
                  </TableCell>
                  <TableCell className="text-center text-sm text-slate-600">
                    {tuition.created_at
                      ? new Date(tuition.created_at).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      {tuition.tuitionUrl && (
                        <a
                          href={tuition.tuitionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100"
                          title="View image"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                      )}
                      <Link
                        href={`/dashboard/website/tuition-fees/${tuition.id}/edit`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-blue-600 transition hover:bg-blue-50"
                        title="Edit tuition"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(tuition)}
                        disabled={isPending}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        title="Delete tuition"
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
        title="Delete Tuition"
        description={
          toDelete
            ? `Are you sure you want to delete "${toDelete.title}"? This action cannot be undone.`
            : "Are you sure you want to delete this tuition? This action cannot be undone."
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

export default TuitionTable;
