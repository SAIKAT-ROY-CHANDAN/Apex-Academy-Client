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

import { deleteDeposit } from "@/services/deposit";
import EditDepositDialog from "./EditDepositDialog";
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
import { TDeposit } from "./types/deposit";

interface DepositTableProps {
  deposits: TDeposit[] | [];
  currentPage: number;
  totalItems: number;
  totalPages?: number;
}

const PAGE_SIZE = 10;

const formatAmount = (amount: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (date?: string) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString();
};

const getDepositTypeName = (deposit: TDeposit) =>
  (deposit as any).depositType?.name ?? (deposit as any).deposit_type?.name ?? null;

const DepositTable = ({ deposits, currentPage, totalItems, totalPages }: DepositTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [depositToDelete, setDepositToDelete] = useState<TDeposit | null>(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [depositToEdit, setDepositToEdit] = useState<TDeposit | null>(null);

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filteredDeposits = useMemo(() => {
    if (!searchQuery.trim()) return deposits;
    const query = searchQuery.toLowerCase();
    return deposits.filter((deposit) => {
      const typeName = getDepositTypeName(deposit) ?? "";
      return (
        deposit.deposit_type_id.toLowerCase().includes(query) ||
        typeName.toLowerCase().includes(query) ||
        deposit.deposit_date?.toLowerCase().includes(query) ||
        deposit.total_amount.toString().includes(query)
      );
    });
  }, [deposits, searchQuery]);

  const paginatedDeposits = filteredDeposits;
  const canGoNext = totalPages ? currentPage < totalPages : deposits.length === PAGE_SIZE;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleEditClick = (deposit: TDeposit) => {
    setDepositToEdit(deposit);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (deposit: TDeposit) => {
    setDepositToDelete(deposit);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!depositToDelete) return;

    startTransition(async () => {
      const response = await deleteDeposit(depositToDelete.id);

      if (!response.success) {
        toast.error(response.message ?? "Failed to delete deposit");
        return;
      }
      toast.success(response.message ?? "Deposit deleted successfully");
      setDeleteDialogOpen(false);
      setDepositToDelete(null);

      // Step back a page if the last row on this page was just removed
      if (paginatedDeposits.length === 1 && currentPage > 1) {
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
          <CardTitle className="text-lg font-semibold">Deposits</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search deposits..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-9 pl-8 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {paginatedDeposits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users2 className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                {searchQuery
                  ? "No deposits match your search."
                  : "No deposits found."}
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                {searchQuery
                  ? "Try a different search term."
                  : "Add a deposit to get started."}
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
                        Deposit Type
                        <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        Amount
                        <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        Date
                        <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </TableHead>
                    <TableHead className="h-10 w-24 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDeposits.map((deposit, index) => (
                    <TableRow
                      key={deposit.id}
                      className="group transition-colors hover:bg-muted/20"
                    >
                      <TableCell className="text-center text-xs text-muted-foreground">
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {getDepositTypeName(deposit) ?? deposit.deposit_type_id ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <span className="inline-flex items-center rounded-md bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          {formatAmount(deposit.total_amount)}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{formatDate(deposit.deposit_date)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:opacity-100"
                            title="Edit deposit"
                            onClick={() => handleEditClick(deposit)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:text-destructive hover:opacity-100"
                            onClick={() => handleDeleteClick(deposit)}
                            title="Delete deposit"
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
                    ? `Showing ${filteredDeposits.length} matching item${filteredDeposits.length === 1 ? "" : "s"}`
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
        title="Delete Deposit"
        description={
          depositToDelete
            ? `Are you sure you want to delete this deposit? This action cannot be undone.`
            : "Are you sure you want to delete this deposit? This action cannot be undone."
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isPending={isPending}
        onConfirm={handleDeleteConfirm}
      />

      <EditDepositDialog
        deposit={depositToEdit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </>
  );
};

export default DepositTable;