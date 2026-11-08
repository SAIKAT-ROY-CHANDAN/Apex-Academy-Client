"use client";

import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Coins,
  Edit,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import { deleteFeeItem } from "@/services/feeItem";
import EditFeeItemDialog from "./EditFeeItemDialog";
import type { TFeeItem } from "./types/fee-item";

interface FeeItemTableProps {
  feeItems: TFeeItem[] | [];
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

const FeeItemTable = ({
  feeItems,
  currentPage,
  totalItems,
  totalPages,
}: FeeItemTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [feeItemToDelete, setFeeItemToDelete] = useState<TFeeItem | null>(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [feeItemToEdit, setFeeItemToEdit] = useState<TFeeItem | null>(null);

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filteredFeeItems = useMemo(() => {
    if (!searchQuery.trim()) return feeItems;
    const query = searchQuery.toLowerCase();
    return feeItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.feeType?.name.toLowerCase().includes(query),
    );
  }, [feeItems, searchQuery]);

  const paginatedFeeItems = filteredFeeItems;
  const canGoNext = totalPages
    ? currentPage < totalPages
    : feeItems.length === PAGE_SIZE;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleEditClick = (item: TFeeItem) => {
    setFeeItemToEdit(item);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (item: TFeeItem) => {
    setFeeItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!feeItemToDelete) return;

    startTransition(async () => {
      const response = await deleteFeeItem(feeItemToDelete.id);

      if (!response.success) {
        toast.error(response.message ?? "Failed to delete fee item");
        return;
      }
      toast.success(response.message ?? "Fee item deleted successfully");
      setDeleteDialogOpen(false);
      setFeeItemToDelete(null);

      // Step back a page if the last row on this page was just removed
      if (paginatedFeeItems.length === 1 && currentPage > 1) {
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
          <CardTitle className="text-lg font-semibold">Fee Items</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search fee items..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-9 pl-8 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {paginatedFeeItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Coins className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                {searchQuery
                  ? "No fee items match your search."
                  : "No fee items found."}
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                {searchQuery
                  ? "Try a different search term."
                  : "Add a fee item to get started."}
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
                        Name
                        <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Fee Type
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Cycle
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Type
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Late Fee
                    </TableHead>
                    <TableHead className="h-10 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Amount
                    </TableHead>
                    <TableHead className="h-10 w-24 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedFeeItems.map((item, index) => (
                    <TableRow
                      key={item.id}
                      className="group transition-colors hover:bg-muted/20"
                    >
                      <TableCell className="text-center text-xs text-muted-foreground">
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.feeType?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.FeeItemType === "OneTime" || !item.feeStartMonth || !item.feeEndMonth
                          ? "—"
                          : `${item.feeStartMonth.slice(0, 3)} → ${item.feeEndMonth.slice(0, 3)}`}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.FeeItemType === "Monthly"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {item.FeeItemType === "Monthly"
                            ? "Monthly"
                            : "One Time"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.isFine ? (
                          <Badge
                            variant="destructive"
                            className="gap-1 text-xs text-white"
                          >
                            <CircleAlert className="h-3 w-3" />
                            Late Fee
                            {item.everydayFine_amount != null && (
                              <span className="font-normal text-destructive-foreground/80">
                                ({formatAmount(item.everydayFine_amount)}/day)
                              </span>
                            )}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-xs text-muted-foreground"
                          >
                            No
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center rounded-md bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          {formatAmount(item.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:opacity-100"
                            title="Edit fee item"
                            onClick={() => handleEditClick(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:text-destructive hover:opacity-100"
                            onClick={() => handleDeleteClick(item)}
                            title="Delete fee item"
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
                    ? `Showing ${filteredFeeItems.length} matching item${filteredFeeItems.length === 1 ? "" : "s"}`
                    : `Showing ${Math.min((currentPage - 1) * PAGE_SIZE + 1, totalItems)}–${Math.min(currentPage * PAGE_SIZE, totalItems)} of ${totalItems}`}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={currentPage === 1}
                    onClick={() =>
                      handlePageChange(Math.max(1, currentPage - 1))
                    }
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
        title="Delete Fee Item"
        description={
          feeItemToDelete
            ? `Are you sure you want to delete "${feeItemToDelete.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this fee item? This action cannot be undone."
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isPending={isPending}
        onConfirm={handleDeleteConfirm}
      />

      <EditFeeItemDialog
        feeItem={feeItemToEdit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </>
  );
};

export default FeeItemTable;
