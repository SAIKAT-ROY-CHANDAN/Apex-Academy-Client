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
import { deleteWebsiteDepartment } from "@/services/websiteDepartment";

export interface DepartmentItem {
  id: string;
  name?: string | null;
  imageUrl?: string | null;
  details?: string | null;
  courseList?: string[] | null;
}

interface DepartmentTableProps {
  departments: DepartmentItem[];
}

const DepartmentTable = ({ departments }: DepartmentTableProps) => {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<DepartmentItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDeleteClick = (department: DepartmentItem) => {
    setToDelete(department);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!toDelete) return;

    startTransition(async () => {
      const response = await deleteWebsiteDepartment(toDelete.id);

      if (!response.success) {
        toast.error(response.message ?? "Failed to delete department");
        return;
      }
      toast.success(response.message ?? "Department deleted successfully");
      setDeleteDialogOpen(false);
      setToDelete(null);
      router.refresh();
    });
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              No departments found.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Try adjusting the search or add a new department.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-50/70 hover:bg-blue-50/70">
                <TableHead className="h-12 w-24 text-center text-sm font-semibold text-slate-700">
                  No.
                </TableHead>
                <TableHead className="h-12 text-sm font-semibold text-slate-700">
                  Name
                </TableHead>
                <TableHead className="h-12 w-28 text-center text-sm font-semibold text-slate-700">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((department, index) => (
                <TableRow
                  key={department.id}
                  className="border-slate-100 hover:bg-slate-50/60"
                >
                  <TableCell className="text-center text-sm text-slate-600">
                    {(index + 1).toString().padStart(2, "0")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {department.imageUrl ? (
                        // biome-ignore lint/performance/noImgElement: backend-served image URL, next/image host depends on the deployment env
                        <img
                          src={department.imageUrl}
                          alt={department.name ?? "Department"}
                          className="h-9 w-9 rounded-md object-cover"
                        />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                          <Building2 className="h-4 w-4" />
                        </span>
                      )}
                      <span className="text-sm font-medium text-slate-800">
                        {department.name ?? "Unnamed"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        href={`/dashboard/website/department/${department.id}/edit`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-blue-600 transition hover:bg-blue-50"
                        title="Edit department"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(department)}
                        disabled={isPending}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        title="Delete department"
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
        title="Delete Department"
        description={
          toDelete
            ? `Are you sure you want to delete ${toDelete.name ?? "this department"}? This action cannot be undone.`
            : "Are you sure you want to delete this department? This action cannot be undone."
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

export default DepartmentTable;
