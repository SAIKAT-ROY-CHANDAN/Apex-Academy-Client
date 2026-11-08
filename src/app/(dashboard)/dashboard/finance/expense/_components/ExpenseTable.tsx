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

import { deleteExpense } from "@/services/expense";
import EditExpenseDialog from "./EditExpenseDialog";
import {
    Coins,
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
import { TExpense } from "./types/expense";

interface ExpenseTableProps {
    expenses: TExpense[] | [];
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

const getExpenseTypeName = (item: TExpense) =>
    (item as any).expenseType?.name ?? (item as any).expense_type?.name ?? "";

const ExpenseTable = ({ expenses, currentPage, totalItems, totalPages }: ExpenseTableProps) => {
    const [searchQuery, setSearchQuery] = useState("");

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState<TExpense | null>(
        null
    );

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [expenseToEdit, setExpenseToEdit] = useState<TExpense | null>(null);

    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const filteredExpenses = useMemo(() => {
        if (!searchQuery.trim()) return expenses;
        const query = searchQuery.toLowerCase();
        return expenses.filter((item) => {
            const typeName = getExpenseTypeName(item);
            return (
                item.expense_date?.toLowerCase().includes(query) ||
                item.total_amount.toString().includes(query) ||
                typeName.toLowerCase().includes(query) ||
                item.expense_type_id.toLowerCase().includes(query)
            );
        });
    }, [expenses, searchQuery]);

    const paginatedExpenses = filteredExpenses;
    const canGoNext = totalPages ? currentPage < totalPages : expenses.length === PAGE_SIZE;

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set("page", String(page));
        router.push(`?${params.toString()}`);
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
    };

    const handleEditClick = (item: TExpense) => {
        setExpenseToEdit(item);
        setEditDialogOpen(true);
    };

    const handleDeleteClick = (item: TExpense) => {
        setExpenseToDelete(item);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!expenseToDelete) return;

        startTransition(async () => {
            const response = await deleteExpense(expenseToDelete.id);

            if (!response.success) {
                toast.error(response.message ?? "Failed to delete expense");
                return;
            }
            toast.success(response.message ?? "Expense deleted successfully");
            setDeleteDialogOpen(false);
            setExpenseToDelete(null);

            if (paginatedExpenses.length === 1 && currentPage > 1) {
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
                    <CardTitle className="text-lg font-semibold">Expenses</CardTitle>
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search expenses..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="h-9 pl-8 text-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {paginatedExpenses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Coins className="mb-3 h-10 w-10 text-muted-foreground/50" />
                            <p className="text-sm font-medium text-muted-foreground">
                                {searchQuery
                                    ? "No expenses match your search."
                                    : "No expenses found."}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground/60">
                                {searchQuery
                                    ? "Try a different search term."
                                    : "Add an expense to get started."}
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
                                                Date
                                                <ArrowUpDown className="h-3 w-3" />
                                            </span>
                                        </TableHead>
                                        <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Expense Type
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
                                    {paginatedExpenses.map((item, index) => (
                                        <TableRow
                                            key={item.id}
                                            className="group transition-colors hover:bg-muted/20"
                                        >
                                            <TableCell className="text-center text-xs text-muted-foreground">
                                                {(currentPage - 1) * PAGE_SIZE + index + 1}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {formatDate(item.expense_date)}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {(item as any).expenseType?.name ?? (item as any).expense_type?.name ?? "—"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="inline-flex items-center rounded-md bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                                    {formatAmount(item.total_amount)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:opacity-100"
                                                        title="Edit expense"
                                                        onClick={() => handleEditClick(item)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:text-destructive hover:opacity-100"
                                                        onClick={() => handleDeleteClick(item)}
                                                        title="Delete expense"
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
                                        ? `Showing ${filteredExpenses.length} matching item${filteredExpenses.length === 1 ? "" : "s"}`
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
                title="Delete Expense"
                description={
                    "Are you sure you want to delete this expense? This action cannot be undone."
                }
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="destructive"
                isPending={isPending}
                onConfirm={handleDeleteConfirm}
            />

            <EditExpenseDialog
                expense={expenseToEdit}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
            />
        </>
    );
};

export default ExpenseTable;