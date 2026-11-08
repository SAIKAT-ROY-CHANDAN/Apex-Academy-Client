"use client";

import { Edit, Trash2, UserRound } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { deleteWebsitePrincipal } from "@/services/websitePrincipal";

export interface PrincipalItem {
  id: string;
  name: string;
  photoUrl?: string | null;
  fromDate: string;
  toDate: string;
}

interface PrincipalsTableProps {
  principals: PrincipalItem[];
  /** Override edit link base, e.g. "/website-settings/principals" */
  editBasePath?: string;
}

function formatDuration(fromDate: string, toDate: string): string {
  try {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (isNaN(from.getTime()) || isNaN(to.getTime())) return `${fromDate} to ${toDate}`;
    return `${format(from, "dd-MM-yyyy")} to ${format(to, "dd-MM-yyyy")}`;
  } catch {
    return `${fromDate} to ${toDate}`;
  }
}

const PrincipalsTable = ({ principals, editBasePath }: PrincipalsTableProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const isWebsiteSettings = pathname.startsWith("/website-settings");
  const base = editBasePath ?? (isWebsiteSettings ? "/website-settings/principals" : "/dashboard/website/principals");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<PrincipalItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDeleteClick = (item: PrincipalItem) => {
    setToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!toDelete) return;

    startTransition(async () => {
      const response = await deleteWebsitePrincipal(toDelete.id);

      if (!response?.success) {
        toast.error(response?.message ?? "Failed to delete principal");
        return;
      }
      toast.success(response.message ?? "Principal deleted successfully");
      setDeleteDialogOpen(false);
      setToDelete(null);
      router.refresh();
    });
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {principals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <UserRound className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              No principals found.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Try adjusting the search or add a new principal.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-50/70 hover:bg-blue-50/70">
                <TableHead className="h-12 w-20 text-center text-sm font-semibold text-slate-700">
                  No.
                </TableHead>
                <TableHead className="h-12 text-sm font-semibold text-slate-700">
                  Name
                </TableHead>
                <TableHead className="h-12 text-center text-sm font-semibold text-slate-700">
                  Duration
                </TableHead>
                <TableHead className="h-12 w-28 text-center text-sm font-semibold text-slate-700">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {principals.map((item, index) => (
                <TableRow
                  key={item.id}
                  className="border-slate-100 hover:bg-slate-50/60"
                >
                  <TableCell className="text-center text-sm text-slate-600">
                    {(index + 1).toString().padStart(2, "0")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {item.photoUrl ? (
                        // biome-ignore lint/performance/noImgElement: backend-served image URL
                        <img
                          src={item.photoUrl}
                          alt={item.name}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                          <UserRound className="h-4 w-4" />
                        </span>
                      )}
                      <span className="text-sm font-medium text-slate-800">
                        {item.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm text-slate-600">
                    {formatDuration(item.fromDate, item.toDate)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        href={`${base}/${item.id}/edit`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-blue-600 transition hover:bg-blue-50"
                        title="Edit principal"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(item)}
                        disabled={isPending}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        title="Delete principal"
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
        title="Delete Principal"
        description={
          toDelete
            ? `Are you sure you want to delete ${toDelete.name}? This action cannot be undone.`
            : "Are you sure you want to delete this principal? This action cannot be undone."
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

export default PrincipalsTable;
