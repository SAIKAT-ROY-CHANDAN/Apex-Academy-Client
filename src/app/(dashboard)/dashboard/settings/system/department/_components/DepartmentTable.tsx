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

import EditDepartmentDialog from "./EditDepartmentDialog";
import {
    Building2,
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
import { TDepartment } from "./types";
import { deleteDepartment } from "@/services/department";

interface DepartmentTableProps {
    departments: TDepartment[] | [];
    currentPage: number;
    totalItems: number;
    totalPages?: number;
}

const PAGE_SIZE = 10;

const DepartmentTable = ({
    departments,
    currentPage,
    totalItems,
    totalPages,
}: DepartmentTableProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [departmentToDelete, setDepartmentToDelete] = useState<TDepartment | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [departmentToEdit, setDepartmentToEdit] = useState<TDepartment | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const filteredDepartments = useMemo(() => {
        if (!searchQuery.trim()) return departments;
        const query = searchQuery.toLowerCase();
        return departments.filter(
            (dept) =>
                dept.department_name.toLowerCase().includes(query) ||
                dept.program?.program_name.toLowerCase().includes(query) ||
                dept.institution?.name.toLowerCase().includes(query)
        );
    }, [departments, searchQuery]);

    const paginatedDepartments = filteredDepartments;
    const canGoNext = totalPages ? currentPage < totalPages : departments.length === PAGE_SIZE;

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set("page", String(page));
        router.push(`?${params.toString()}`);
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
    };

    const handleEditClick = (dept: TDepartment) => {
        setDepartmentToEdit(dept);
        setEditDialogOpen(true);
    };

    const handleDeleteClick = (dept: TDepartment) => {
        setDepartmentToDelete(dept);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!departmentToDelete) return;

        startTransition(async () => {
            const response = await deleteDepartment(departmentToDelete.id);

            if (!response.success) {
                toast.error(response.message ?? "Failed to delete department");
                return;
            }
            toast.success(response.message ?? "Department deleted successfully");
            setDeleteDialogOpen(false);
            setDepartmentToDelete(null);

            if (paginatedDepartments.length === 1 && currentPage > 1) {
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
                    <CardTitle className="text-lg font-semibold">
                        Departments
                    </CardTitle>
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search departments..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="h-9 pl-8 text-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {paginatedDepartments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Building2 className="mb-3 h-10 w-10 text-muted-foreground/50" />
                            <p className="text-sm font-medium text-muted-foreground">
                                {searchQuery
                                    ? "No departments match your search."
                                    : "No departments found."}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground/60">
                                {searchQuery
                                    ? "Try a different search term."
                                    : "Add a department to get started."}
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
                                                Department Name
                                                <ArrowUpDown className="h-3 w-3" />
                                            </span>
                                        </TableHead>
                                        <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Program
                                        </TableHead>
                                        <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Institution
                                        </TableHead>
                                        <TableHead className="h-10 w-24 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedDepartments.map((dept, index) => (
                                        <TableRow
                                            key={dept.id}
                                            className="group transition-colors hover:bg-muted/20"
                                        >
                                            <TableCell className="text-center text-xs text-muted-foreground">
                                                {(currentPage - 1) * PAGE_SIZE + index + 1}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {dept.department_name}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {dept.program?.program_name ?? "—"}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {dept.institution?.name ?? "—"}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:opacity-100"
                                                        title="Edit department"
                                                        onClick={() => handleEditClick(dept)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:text-destructive hover:opacity-100"
                                                        onClick={() => handleDeleteClick(dept)}
                                                        title="Delete department"
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
                                        ? `Showing ${filteredDepartments.length} matching item${filteredDepartments.length === 1 ? "" : "s"}`
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
                title="Delete Department"
                description={
                    departmentToDelete
                        ? `Are you sure you want to delete "${departmentToDelete.department_name}"? This action cannot be undone.`
                        : "Are you sure you want to delete this department? This action cannot be undone."
                }
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="destructive"
                isPending={isPending}
                onConfirm={handleDeleteConfirm}
            />

            <EditDepartmentDialog
                department={departmentToEdit}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
            />
        </>
    );
};

export default DepartmentTable;
