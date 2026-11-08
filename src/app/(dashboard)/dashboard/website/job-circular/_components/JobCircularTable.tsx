"use client";

import { Briefcase, Edit, Eye, Trash2 } from "lucide-react";
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
import { deleteWebsiteJobCircular } from "@/services/websiteJobCircular";

export interface JobCircularItem {
  id: string;
  positionName?: string | null;
  positionType?: string | null;
  educationalQualification?: string | null;
  applyFee?: string | null;
  imageUrl?: string | null;
  description?: string | null;
}

interface JobCircularTableProps {
  jobs: JobCircularItem[];
}

const JobCircularTable = ({ jobs }: JobCircularTableProps) => {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<JobCircularItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDeleteClick = (job: JobCircularItem) => {
    setToDelete(job);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!toDelete) return;

    startTransition(async () => {
      const response = await deleteWebsiteJobCircular(toDelete.id);

      if (!response.success) {
        toast.error(response.message ?? "Failed to delete job circular");
        return;
      }
      toast.success(response.message ?? "Job circular deleted successfully");
      setDeleteDialogOpen(false);
      setToDelete(null);
      router.refresh();
    });
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Briefcase className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              No job circulars found.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Try adjusting the search or post a new job.
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
                  Position Name
                </TableHead>
                <TableHead className="h-12 text-center text-sm font-semibold text-slate-700">
                  Position Type
                </TableHead>
                <TableHead className="h-12 text-center text-sm font-semibold text-slate-700">
                  Educational Qualification
                </TableHead>
                <TableHead className="h-12 text-center text-sm font-semibold text-slate-700">
                  Apply Fee
                </TableHead>
                <TableHead className="h-12 w-32 text-center text-sm font-semibold text-slate-700">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job, index) => (
                <TableRow
                  key={job.id}
                  className="border-slate-100 hover:bg-slate-50/60"
                >
                  <TableCell className="text-center text-sm text-slate-600">
                    {(index + 1).toString().padStart(2, "0")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {job.imageUrl ? (
                        // biome-ignore lint/performance/noImgElement: backend-served image URL, next/image host depends on the deployment env
                        <img
                          src={job.imageUrl}
                          alt={job.positionName ?? "Job"}
                          className="h-9 w-9 rounded-md object-cover"
                        />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                          <Briefcase className="h-4 w-4" />
                        </span>
                      )}
                      <span className="text-sm font-medium text-slate-800">
                        {job.positionName ?? "Unnamed"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm text-slate-600">
                    {job.positionType ?? "—"}
                  </TableCell>
                  <TableCell className="max-w-56 truncate text-center text-sm text-slate-600">
                    {job.educationalQualification ?? "—"}
                  </TableCell>
                  <TableCell className="text-center text-sm text-slate-600">
                    {job.applyFee ?? "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        href={`/dashboard/website/job-circular/${job.id}/applicants`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-emerald-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                        title="View Paid Applicants"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/dashboard/website/job-circular/${job.id}/edit`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-blue-600 transition hover:bg-blue-50"
                        title="Edit job circular"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(job)}
                        disabled={isPending}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        title="Delete job circular"
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
        title="Delete Job Circular"
        description={
          toDelete
            ? `Are you sure you want to delete the job circular for ${toDelete.positionName ?? "this position"}? This action cannot be undone.`
            : "Are you sure you want to delete this job circular? This action cannot be undone."
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

export default JobCircularTable;
