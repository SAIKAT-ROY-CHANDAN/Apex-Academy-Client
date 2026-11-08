"use client";

import { Edit, Trash2, UserRound } from "lucide-react";
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
import { deleteWebsiteGoverningBodyMember } from "@/services/websiteGoverningBody";

export interface GoverningBodyMember {
  id: string;
  imageUrl?: string | null;
  name?: string | null;
  designation?: string | null;
  isFeatured?: boolean;
}

interface GoverningBodyTableProps {
  members: GoverningBodyMember[];
}

const GoverningBodyTable = ({ members }: GoverningBodyTableProps) => {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<GoverningBodyMember | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDeleteClick = (member: GoverningBodyMember) => {
    setToDelete(member);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!toDelete) return;

    startTransition(async () => {
      const response = await deleteWebsiteGoverningBodyMember(toDelete.id);

      if (!response.success) {
        toast.error(response.message ?? "Failed to delete member");
        return;
      }
      toast.success(response.message ?? "Member deleted successfully");
      setDeleteDialogOpen(false);
      setToDelete(null);
      router.refresh();
    });
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <UserRound className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              No governing body members found.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Try adjusting the search or add a new member.
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
                <TableHead className="h-12 text-center text-sm font-semibold text-slate-700">
                  Designation
                </TableHead>
                <TableHead className="h-12 w-28 text-center text-sm font-semibold text-slate-700">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member, index) => (
                <TableRow
                  key={member.id}
                  className="border-slate-100 hover:bg-slate-50/60"
                >
                  <TableCell className="text-center text-sm text-slate-600">
                    {(index + 1).toString().padStart(2, "0")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {member.imageUrl ? (
                        // biome-ignore lint/performance/noImgElement: backend-served image URL, next/image host depends on the deployment env
                        <img
                          src={member.imageUrl}
                          alt={member.name ?? "Member"}
                          className="h-9 w-9 rounded-md object-cover"
                        />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                          <UserRound className="h-4 w-4" />
                        </span>
                      )}
                      <span className="text-sm font-medium text-slate-800">
                        {member.name ?? "Unnamed"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm text-slate-600">
                    {member.designation ?? "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        href={`/dashboard/website/governing-body-administrators/${member.id}/edit`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-blue-600 transition hover:bg-blue-50"
                        title="Edit member"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(member)}
                        disabled={isPending}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        title="Delete member"
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
        title="Delete Member"
        description={
          toDelete
            ? `Are you sure you want to delete ${toDelete.name ?? "this member"}? This action cannot be undone.`
            : "Are you sure you want to delete this member? This action cannot be undone."
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

export default GoverningBodyTable;
