"use client";

import { Briefcase, Edit, Trash2, Eye, EyeOff } from "lucide-react";
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
import { deleteCareerDevelopments } from "@/services/careerDevelopments";

export interface CareerDevelopmentsItem {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CareerDevelopmentsTableProps {
  careerDevelopments: CareerDevelopmentsItem[];
}

const CareerDevelopmentsTable = ({ careerDevelopments }: CareerDevelopmentsTableProps) => {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<CareerDevelopmentsItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDeleteClick = (item: CareerDevelopmentsItem) => {
    setToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!toDelete) return;

    startTransition(async () => {
      const response = await deleteCareerDevelopments(toDelete.id);

      if (!response.success) {
        toast.error(response.message ?? "Failed to delete career development");
        return;
      }
      toast.success(response.message ?? "Career development deleted successfully");
      setDeleteDialogOpen(false);
      setToDelete(null);
      router.refresh();
    });
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {careerDevelopments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Briefcase className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              No career developments found.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Try adjusting the search or add a new career development.
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
                <TableHead className="h-12 w-24 text-center text-sm font-semibold text-slate-700">
                  Status
                </TableHead>
                <TableHead className="h-12 w-20 text-center text-sm font-semibold text-slate-700">
                  Order
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
              {careerDevelopments.map((item, index) => (
                <TableRow
                  key={item.id}
                  className="border-slate-100 hover:bg-slate-50/60"
                >
                  <TableCell className="text-center text-sm text-slate-600">
                    {(index + 1).toString().padStart(2, "0")}
                  </TableCell>
                  <TableCell className="max-w-[320px]">
                    <div className="space-y-0.5">
                      <span
                        className="block truncate text-sm font-medium text-slate-800"
                        title={item.title}
                      >
                        {item.title}
                      </span>
                      {item.description && (
                        <span className="block truncate text-xs text-slate-500 max-w-[320px]">
                          {item.description
                            .replace(/<[^>]*>/g, "")
                            .slice(0, 80)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {item.imageUrl ? (
                      <a
                        href={item.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex justify-center"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-10 w-16 rounded-md object-cover border border-slate-200"
                        />
                      </a>
                    ) : (
                      <span className="inline-flex h-10 w-16 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                        <Briefcase className="h-4 w-4" />
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-sm text-slate-600">
                    {item.order}
                  </TableCell>
                  <TableCell className="text-center text-sm text-slate-600">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        href={`/dashboard/website/career-developments/${item.id}/edit`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-blue-600 transition hover:bg-blue-50"
                        title="Edit career development"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(item)}
                        disabled={isPending}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        title="Delete career development"
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
        title="Delete Career Development"
        description={
          toDelete
            ? `Are you sure you want to delete "${toDelete.title}"? This action cannot be undone.`
            : "Are you sure you want to delete this career development? This action cannot be undone."
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

export default CareerDevelopmentsTable;