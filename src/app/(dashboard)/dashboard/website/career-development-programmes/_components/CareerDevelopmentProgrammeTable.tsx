"use client";

import { Edit, Eye, GraduationCap, Trash2 } from "lucide-react";
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
import { deleteWebsiteCareerDevelopmentProgramme } from "@/services/websiteCareerDevelopmentProgramme";

export interface CareerDevelopmentProgrammeItem {
  id: string;
  programName?: string | null;
  entryFee?: string | null;
  description?: string | null;
}

interface CareerDevelopmentProgrammeTableProps {
  programmes: CareerDevelopmentProgrammeItem[];
}

// The description comes from a rich-text editor (HTML) — strip the tags so the
// table shows a clean plain-text preview instead of raw markup.
const stripHtml = (html?: string | null) =>
  (html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const CareerDevelopmentProgrammeTable = ({
  programmes,
}: CareerDevelopmentProgrammeTableProps) => {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDelete, setToDelete] =
    useState<CareerDevelopmentProgrammeItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDeleteClick = (programme: CareerDevelopmentProgrammeItem) => {
    setToDelete(programme);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!toDelete) return;

    startTransition(async () => {
      const response = await deleteWebsiteCareerDevelopmentProgramme(
        toDelete.id,
      );

      if (!response.success) {
        toast.error(
          response.message ?? "Failed to delete career development programme",
        );
        return;
      }
      toast.success(
        response.message ?? "Career development programme deleted successfully",
      );
      setDeleteDialogOpen(false);
      setToDelete(null);
      router.refresh();
    });
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {programmes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <GraduationCap className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              No career development programmes found.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Try adjusting the search or add a new programme.
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
                  Programme Name
                </TableHead>
                <TableHead className="h-12 text-center text-sm font-semibold text-slate-700">
                  Entry Fee
                </TableHead>
                <TableHead className="h-12 text-sm font-semibold text-slate-700">
                  Description
                </TableHead>
                <TableHead className="h-12 w-28 text-center text-sm font-semibold text-slate-700">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programmes.map((programme, index) => (
                <TableRow
                  key={programme.id}
                  className="border-slate-100 hover:bg-slate-50/60"
                >
                  <TableCell className="text-center text-sm text-slate-600">
                    {(index + 1).toString().padStart(2, "0")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                        <GraduationCap className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-medium text-slate-800">
                        {programme.programName ?? "Unnamed"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm text-slate-600">
                    {programme.entryFee ?? "—"}
                  </TableCell>
                  <TableCell className="max-w-56 truncate text-sm text-slate-600">
                    {stripHtml(programme.description) || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        href={`/dashboard/website/career-development-programmes/${programme.id}/applications`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100"
                        title="View applications"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/dashboard/website/career-development-programmes/${programme.id}/edit`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-blue-600 transition hover:bg-blue-50"
                        title="Edit career development programme"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(programme)}
                        disabled={isPending}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        title="Delete career development programme"
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
        title="Delete Career Development Programme"
        description={
          toDelete
            ? `Are you sure you want to delete ${toDelete.programName ?? "this programme"}? This action cannot be undone.`
            : "Are you sure you want to delete this career development programme? This action cannot be undone."
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

export default CareerDevelopmentProgrammeTable;
