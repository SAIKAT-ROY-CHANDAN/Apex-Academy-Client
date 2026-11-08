"use client";

import { Trash2, Users } from "lucide-react";
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
import type { CareerDevelopmentApplication } from "@/services/websiteCareerDevelopmentApplication";
import { deleteWebsiteCareerDevelopmentApplication } from "@/services/websiteCareerDevelopmentApplication";

interface CareerDevelopmentApplicationsTableProps {
  applications: CareerDevelopmentApplication[];
}

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const CareerDevelopmentApplicationsTable = ({
  applications,
}: CareerDevelopmentApplicationsTableProps) => {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<CareerDevelopmentApplication | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  const handleDeleteClick = (application: CareerDevelopmentApplication) => {
    setToDelete(application);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!toDelete) return;

    startTransition(async () => {
      const response = await deleteWebsiteCareerDevelopmentApplication(
        toDelete.id,
      );

      if (!response.success) {
        toast.error(response.message ?? "Failed to delete application");
        return;
      }
      toast.success(response.message ?? "Application deleted successfully");
      setDeleteDialogOpen(false);
      setToDelete(null);
      router.refresh();
    });
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              No applications found for this programme.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Applications submitted from the website will appear here.
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
                  Full Name
                </TableHead>
                <TableHead className="h-12 text-sm font-semibold text-slate-700">
                  Phone
                </TableHead>
                <TableHead className="h-12 text-sm font-semibold text-slate-700">
                  Email
                </TableHead>
                <TableHead className="h-12 text-sm font-semibold text-slate-700">
                  Address
                </TableHead>
                <TableHead className="h-12 text-sm font-semibold text-slate-700">
                  Applied
                </TableHead>
                <TableHead className="h-12 w-28 text-center text-sm font-semibold text-slate-700">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application, index) => (
                <TableRow
                  key={application.id}
                  className="border-slate-100 hover:bg-slate-50/60"
                >
                  <TableCell className="text-center text-sm text-slate-600">
                    {(index + 1).toString().padStart(2, "0")}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-slate-800">
                      {application.fullName}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {application.phone || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {application.email || "—"}
                  </TableCell>
                  <TableCell className="max-w-56 truncate text-sm text-slate-600">
                    {application.address || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {formatDate(application.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(application)}
                        disabled={isPending}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        title="Delete application"
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
        title="Delete Application"
        description={
          toDelete
            ? `Are you sure you want to delete the application from ${toDelete.fullName}? This action cannot be undone.`
            : "Are you sure you want to delete this application? This action cannot be undone."
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

export default CareerDevelopmentApplicationsTable;
