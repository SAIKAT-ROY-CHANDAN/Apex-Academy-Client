"use client";

import { Building2, Edit, Trash2 } from "lucide-react";
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
import { deleteAcademicFacilities } from "@/services/academicFacilities";

export interface FacilityItem {
  id: string;
  name: string;
  facilities_type?: string | null;
  main_image_url?: string | null;
  sub_one_image_url?: string | null;
  sub_two_image_url?: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

const FACILITIES_TYPE_LABEL: Record<string, string> = {
  CAMPUS: "Campus",
  SCHOLARSHIP: "Scholarship",
  LIBRARY: "Library",
  STUDENT_CLUB: "Student Club",
};

interface FacilitiesTableProps {
  facilities: FacilityItem[];
}

const FacilitiesTable = ({ facilities }: FacilitiesTableProps) => {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<FacilityItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDeleteClick = (facility: FacilityItem) => {
    setToDelete(facility);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!toDelete) return;

    startTransition(async () => {
      const response = await deleteAcademicFacilities(toDelete.id);

      if (!response.success) {
        toast.error(response.message ?? "Failed to delete facility");
        return;
      }
      toast.success(response.message ?? "Facility deleted successfully");
      setDeleteDialogOpen(false);
      setToDelete(null);
      router.refresh();
    });
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {facilities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              No facilities found.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Try adjusting the search or add a new facility.
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
                  Name
                </TableHead>
                <TableHead className="h-12 text-center text-sm font-semibold text-slate-700">
                  Type
                </TableHead>
                <TableHead className="h-12 w-32 text-center text-sm font-semibold text-slate-700">
                  Main Image
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
              {facilities.map((facility, index) => (
                <TableRow
                  key={facility.id}
                  className="border-slate-100 hover:bg-slate-50/60"
                >
                  <TableCell className="text-center text-sm text-slate-600">
                    {(index + 1).toString().padStart(2, "0")}
                  </TableCell>
                    <TableCell className="max-w-[320px]">
                    <div className="space-y-0.5">
                      <span
                        className="block truncate text-sm font-medium text-slate-800"
                        title={facility.name}
                      >
                        {facility.name}
                      </span>
                      {facility.description && (
                        <span className="block truncate text-xs text-slate-500 max-w-[320px]">
                          {facility.description
                            .replace(/<[^>]*>/g, "")
                            .slice(0, 80)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {facility.facilities_type ? (
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        {FACILITIES_TYPE_LABEL[facility.facilities_type] ??
                          facility.facilities_type}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {facility.main_image_url ? (
                      <a
                        href={facility.main_image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex justify-center"
                      >
                        {/* biome-ignore lint/performance/noImgElement: external image url */}
                        <img
                          src={facility.main_image_url}
                          alt={facility.name}
                          className="h-10 w-16 rounded-md object-cover border border-slate-200"
                        />
                      </a>
                    ) : (
                      <span className="inline-flex h-10 w-16 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                        <Building2 className="h-4 w-4" />
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-sm text-slate-600">
                    {facility.created_at
                      ? new Date(facility.created_at).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        href={`/dashboard/website/student-facilities/${facility.id}/edit`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-blue-600 transition hover:bg-blue-50"
                        title="Edit facility"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(facility)}
                        disabled={isPending}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        title="Delete facility"
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
        title="Delete Facility"
        description={
          toDelete
            ? `Are you sure you want to delete "${toDelete.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this facility? This action cannot be undone."
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

export default FacilitiesTable;
