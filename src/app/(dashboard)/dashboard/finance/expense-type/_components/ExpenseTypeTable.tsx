"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { deleteExpenseType } from "@/services/expenseType";
import EditExpenseTypeDialog from "./EditExpenseTypeDialog";
import {
  Users2,
  Edit,
  Search,
  ArrowUpDown,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo, useTransition } from "react";
import { toast } from "sonner";
import { TExpenseType } from "./Types/expense-type";

interface ExpenseTypeTableProps {
  expenseTypes: TExpenseType[] | [];
  currentPage: number;
  totalItems: number;
  totalPages?: number;
}

const PAGE_SIZE = 10;

const ExpenseTypeTable = ({ expenseTypes, currentPage, totalItems, totalPages }: ExpenseTypeTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseTypeToDelete, setExpenseTypeToDelete] = useState<TExpenseType | null>(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [expenseTypeToEdit, setExpenseTypeToEdit] = useState<TExpenseType | null>(null);

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filteredExpenseTypes = useMemo(() => {
    if (!searchQuery.trim()) return expenseTypes;
    const query = searchQuery.toLowerCase();
    return expenseTypes.filter((expenseType) =>
      expenseType.name.toLowerCase().includes(query)
    );
  }, [expenseTypes, searchQuery]);

  const paginatedExpenseTypes = filteredExpenseTypes;
  const canGoNext = totalPages ? currentPage < totalPages : expenseTypes.length === PAGE_SIZE;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleEditClick = (expenseType: TExpenseType) => {
    setExpenseTypeToEdit(expenseType);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (expenseType: TExpenseType) => {
    setExpenseTypeToDelete(expenseType);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!expenseTypeToDelete) return;

    startTransition(async () => {
      const response = await deleteExpenseType(expenseTypeToDelete.id);

      if (!response.success) {
        toast.error(response.message ?? "Failed to delete expense type");
        return;
      }
      toast.success(response.message ?? "Expense type deleted successfully");
      setDeleteDialogOpen(false);
      setExpenseTypeToDelete(null);

      // Step back a page if the last row on this page was just removed
      if (paginatedExpenseTypes.length === 1 && currentPage > 1) {
        handlePageChange(currentPage - 1);
        return;
      }
      router.refresh();
    });
  };

  return (
    <>
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="text-lg font-semibold">Expense Types</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search expense types..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-9 pl-8 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {paginatedExpenseTypes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users2 className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                {searchQuery
                  ? "No expense types match your search."
                  : "No expense types found."}
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                {searchQuery
                  ? "Try a different search term."
                  : "Add an expense type to get started."}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="h-10 w-12 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      #
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        Expense Type Name
                        <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </TableHead>
                    <TableHead className="h-10 w-24 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedExpenseTypes.map((expenseType, index) => (
                    <TableRow
                      key={expenseType.id}
                      className="group transition-colors hover:bg-muted/20"
                    >
                      <TableCell className="text-center text-xs text-muted-foreground">
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                      {expenseType.name}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:opacity-100"
                            title="Edit expense type"
                            onClick={() => handleEditClick(expenseType)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:text-destructive hover:opacity-100"
                            onClick={() => handleDeleteClick(expenseType)}
                            title="Delete expense type"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  {searchQuery
                    ? `Showing ${filteredExpenseTypes.length} matching item${filteredExpenseTypes.length === 1 ? "" : "s"}`
                    : `Showing ${Math.min((currentPage - 1) * PAGE_SIZE + 1, totalItems)}–${Math.min(currentPage * PAGE_SIZE, totalItems)} of ${totalItems}`}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-2 text-xs text-muted-foreground">
                    Page {currentPage}
                    {totalPages ? ` of ${totalPages}` : ""}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={!canGoNext}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Expense Type"
        description={
          expenseTypeToDelete
            ? `Are you sure you want to delete "${expenseTypeToDelete.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this expense type? This action cannot be undone."
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isPending={isPending}
        onConfirm={handleDeleteConfirm}
      />

      <EditExpenseTypeDialog
        expenseType={expenseTypeToEdit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </>
  );
};

export default ExpenseTypeTable;