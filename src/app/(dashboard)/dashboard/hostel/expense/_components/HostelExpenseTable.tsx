"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { deleteHostelExpense } from "@/services/hostelExpense";
import {
  ChevronLeft,
  ChevronRight,
  Coins,
  Download,
  Edit,
  Eye,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { HostelExpense } from "./types/hostelExpense";

interface HostelExpenseTableProps {
  expenses: HostelExpense[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  appliedFilter: {
    fromDate?: string;
    toDate?: string;
    expenseBy?: string;
    searchTerm?: string;
  };
}

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (date?: string) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const padZero = (num: number) => String(num).padStart(2, "0");

const HostelExpenseTable = ({
  expenses,
  currentPage,
  pageSize,
  totalItems,
  totalPages,
  appliedFilter,
}: HostelExpenseTableProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [searchInput, setSearchInput] = useState(
    appliedFilter.searchTerm ?? "",
  );
  const [fromDate, setFromDate] = useState(appliedFilter.fromDate ?? "");
  const [toDate, setToDate] = useState(appliedFilter.toDate ?? "");
  const [expenseBy, setExpenseBy] = useState(appliedFilter.expenseBy ?? "");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<HostelExpense | null>(
    null,
  );

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const buildQueryParams = (pageOverride?: number) => {
    const params = new URLSearchParams();
    const page = pageOverride ?? currentPage;
    if (page && page !== 1) params.set("page", String(page));
    if (searchInput.trim()) params.set("searchTerm", searchInput.trim());
    if (fromDate) params.set("fromDate", fromDate);
    if (toDate) params.set("toDate", toDate);
    if (expenseBy) params.set("expenseBy", expenseBy);
    return params.toString();
  };

  const handlePageChange = (page: number) => {
    const qs = buildQueryParams(page);
    router.push(`/dashboard/hostel/expense${qs ? `?${qs}` : ""}`);
  };

  const handleConfirmFilter = () => {
    const qs = buildQueryParams(1);
    router.push(`/dashboard/hostel/expense${qs ? `?${qs}` : ""}`);
  };

  const handleClearFilter = () => {
    setFromDate("");
    setToDate("");
    setExpenseBy("");
    setSearchInput("");
    router.push("/dashboard/hostel/expense");
  };

  const handleDeleteClick = (item: HostelExpense) => {
    setExpenseToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!expenseToDelete) return;
    startTransition(async () => {
      const response = await deleteHostelExpense(expenseToDelete.id);
      if (!response.success) {
        toast.error(response.message ?? "Failed to delete hostel expense");
        return;
      }
      toast.success(response.message ?? "Hostel expense deleted successfully");
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
      if (expenses.length === 1 && currentPage > 1) {
        handlePageChange(currentPage - 1);
        return;
      }
      router.refresh();
    });
  };

  const handleExport = () => {
    const headers = [
      "SL No.",
      "Date",
      "Amount",
      "Expense By",
      "Items & Details",
    ];
    const rows = expenses.map((item, idx) => {
      const itemsText =
        item.hostelExpenseItems
          ?.map(
            (itm) =>
              `${itm.item_name} - ${itm.item_amount}`,
          )
          .join("; ") ?? "";
      return [
        (currentPage - 1) * pageSize + idx + 1,
        formatDate(item.expense_date),
        item.total_amount,
        "Admin",
        itemsText,
      ];
    });
    const csv = [headers, ...rows]
      .map((r) => r.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hostel-expenses-${new Date().toISOString().split("T")[0]
      }.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Expense report exported as CSV");
  };

  return (
    <>
      <Card className="border-border/50 shadow-sm">
        <CardContent className="space-y-5 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
            <div className="grid gap-2">
              <Label htmlFor="fromDate" className="text-sm font-medium">
                From
              </Label>
              <Input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="toDate" className="text-sm font-medium">
                To
              </Label>
              <Input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expenseBy" className="text-sm font-medium">
                Expense By
              </Label>
              <Select
                id="expenseBy"
                value={expenseBy}
                onValueChange={(value) => setExpenseBy(value ?? "")}
              >
                <SelectTrigger id="expenseBy" className="h-11">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2 md:col-span-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClearFilter}
                className="h-11 flex-1"
              >
                <X className="mr-1.5 h-4 w-4" />
                Clear Filter
              </Button>
              <Button
                type="button"
                onClick={handleConfirmFilter}
                className="h-11 flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Confirm
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-start justify-between gap-3 border-t border-border/50 pt-4 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="default"
              onClick={handleExport}
              className="h-10 w-full bg-primary px-5 text-primary-foreground hover:bg-primary/90 sm:w-auto"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-0">
          {expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Coins className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                No hostel expenses found.
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Add a hostel expense to get started.
              </p>
              <Button className="mt-4 h-9 bg-primary">
                <Link href="/dashboard/hostel/expense/add-expense">
                  Add Expense
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="h-10 w-16 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      SL No.
                    </TableHead>
                    <TableHead className="h-10 w-32 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Date
                    </TableHead>
                    <TableHead className="h-10 w-36 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Amount
                    </TableHead>
                    <TableHead className="h-10 w-28 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Expense By
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Items &amp; Details
                    </TableHead>
                    <TableHead className="h-10 w-28 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((item, index) => {
                    const sl = (currentPage - 1) * pageSize + index + 1;
                    const itemsText =
                      item.hostelExpenseItems
                        ?.map(
                          (itm) =>
                            `${itm.item_name} - (${formatAmount(
                              Number(itm.item_amount),
                            )})`,
                        )
                        .join(", ") ?? "—";
                    return (
                      <TableRow
                        key={item.id}
                        className="group transition-colors hover:bg-muted/20"
                      >
                        <TableCell className="text-center text-xs text-muted-foreground">
                          {padZero(sl)}
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {formatDate(item.expense_date)}
                        </TableCell>
                        <TableCell className="text-sm">
                          <span className="inline-flex items-center rounded-md bg-muted/50 px-2.5 py-1 text-xs font-semibold text-primary">
                            {formatAmount(Number(item.total_amount))}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          Admin
                        </TableCell>
                        <TableCell className="max-w-lg text-sm text-muted-foreground">
                          <div className="line-clamp-2 max-w-full">
                            {itemsText}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Link href={`/dashboard/hostel/expense/${item.id}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground opacity-70 transition-opacity hover:text-primary hover:opacity-100"
                                title="View details"

                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link
                              href={`/dashboard/hostel/expense/edit/${item.id}`}
                            >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground opacity-70 transition-opacity hover:text-green-600 hover:opacity-100"
                              title="Edit expense"

                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                              </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground opacity-70 transition-opacity hover:text-destructive hover:opacity-100"
                              onClick={() => handleDeleteClick(item)}
                              title="Delete expense"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="flex flex-col items-center justify-between gap-3 border-t border-border/50 px-4 py-3 sm:flex-row">
                <p className="text-xs text-muted-foreground">
                  Showing{" "}
                  {totalItems === 0
                    ? 0
                    : Math.min((currentPage - 1) * pageSize + 1, totalItems)}
                  –{Math.min(currentPage * pageSize, totalItems)} of{" "}
                  {totalItems} entries
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    disabled={!canGoPrev}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous</span>
                  </Button>

                  <PaginationNumbers
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    disabled={!canGoNext}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next</span>
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
        title="Delete Hostel Expense"
        description="Are you sure you want to delete this hostel expense? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isPending={isPending}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

function PaginationNumbers({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages: (number | "ellipsis")[] = [];
  const push = (val: number | "ellipsis") => pages.push(val);
  const windowSize = 1;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - windowSize && i <= currentPage + windowSize)
    ) {
      push(i);
    } else if (pages[pages.length - 1] !== "ellipsis") {
      push("ellipsis");
    }
  }

  return (
    <div className="flex items-center gap-1 px-1">
      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span key={`e-${i}`} className="px-2 text-xs text-muted-foreground">
            ...
          </span>
        ) : (
          <Button
            key={p}
            size="sm"
            variant={currentPage === p ? "default" : "ghost"}
            className={`h-8 min-w-8 px-2 text-xs ${currentPage === p
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : ""
              }`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ),
      )}
    </div>
  );
}

export default HostelExpenseTable;
