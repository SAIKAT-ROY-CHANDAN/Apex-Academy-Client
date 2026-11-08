"use client";

import { Edit, HelpCircle, Trash2 } from "lucide-react";
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
import { deleteWebsiteFaq } from "@/services/websiteFaq";

export interface FaqItem {
  id: string;
  question?: string | null;
  answer?: string | null;
}

interface FaqTableProps {
  faqs: FaqItem[];
}

const FaqTable = ({ faqs }: FaqTableProps) => {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<FaqItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDeleteClick = (faq: FaqItem) => {
    setToDelete(faq);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!toDelete) return;

    startTransition(async () => {
      const response = await deleteWebsiteFaq(toDelete.id);

      if (!response.success) {
        toast.error(response.message ?? "Failed to delete FAQ");
        return;
      }
      toast.success(response.message ?? "FAQ deleted successfully");
      setDeleteDialogOpen(false);
      setToDelete(null);
      router.refresh();
    });
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {faqs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <HelpCircle className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              No FAQs found.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Try adjusting the search or add a new FAQ.
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
                  Question
                </TableHead>
                <TableHead className="h-12 text-sm font-semibold text-slate-700">
                  Answer
                </TableHead>
                <TableHead className="h-12 w-28 text-center text-sm font-semibold text-slate-700">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faqs.map((faq, index) => (
                <TableRow
                  key={faq.id}
                  className="border-slate-100 hover:bg-slate-50/60"
                >
                  <TableCell className="text-center text-sm text-slate-600">
                    {(index + 1).toString().padStart(2, "0")}
                  </TableCell>
                  <TableCell className="max-w-[320px]">
                    <span className="line-clamp-2 text-sm font-medium text-slate-800">
                      {faq.question ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[380px]">
                    <span className="line-clamp-2 text-sm text-slate-600">
                      {faq.answer ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        href={`/dashboard/website/faqs/${faq.id}/edit`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-blue-600 transition hover:bg-blue-50"
                        title="Edit FAQ"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(faq)}
                        disabled={isPending}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        title="Delete FAQ"
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
        title="Delete FAQ"
        description={
          toDelete
            ? `Are you sure you want to delete "${toDelete.question ?? "this FAQ"}"? This action cannot be undone.`
            : "Are you sure you want to delete this FAQ? This action cannot be undone."
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

export default FaqTable;
