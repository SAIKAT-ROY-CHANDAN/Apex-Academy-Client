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

import EditClassDialog from "./EditClassDialog";
import {
    GraduationCap,
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
import { TClass } from "./types/types";
import { deleteClass } from "@/services/academicClass";
import type { Department, Program } from "./types/types";

interface ClassTableProps {
    classes: TClass[] | [];
    institution: string;
    currentPage: number;
    totalItems: number;
    totalPages?: number;
    programs: Program[];
    departments: Department[];
    onClassUpdated?: (updatedClass: TClass) => void;
}

const PAGE_SIZE = 10;

const ClassTable = ({ classes, institution, currentPage, totalItems, totalPages, programs, departments, onClassUpdated }: ClassTableProps) => {
    const isSchool = institution === "SCHOOL";
    const [searchQuery, setSearchQuery] = useState("");

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [classToDelete, setClassToDelete] = useState<TClass | null>(null);

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [classToEdit, setClassToEdit] = useState<TClass | null>(null);

    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const getProgramName = (cls: TClass) => {
        if (cls.program?.program_name) return cls.program.program_name;
        if ((cls.program as any)?.name) return (cls.program as any).name;
        if (cls.program_id) {
            const found = programs.find((p) => p.id === cls.program_id);
            if (found?.program_name) return found.program_name;
            if ((found as any)?.name) return (found as any).name;
        }
        if (cls.department_id) {
            const dept = departments.find((d) => d.id === cls.department_id);
            if ((dept as any)?.program?.program_name) return (dept as any).program.program_name;
            if ((dept as any)?.program_id) {
                const found = programs.find((p) => p.id === (dept as any).program_id);
                if (found?.program_name) return found.program_name;
            }
        }
        return "—";
    };

    const getDepartmentName = (cls: TClass) => {
        if (cls.department?.department_name) return cls.department.department_name;
        if ((cls.department as any)?.name) return (cls.department as any).name;
        if (cls.department_id) {
            const found = departments.find((d) => d.id === cls.department_id);
            if (found?.department_name) return found.department_name;
            if ((found as any)?.name) return (found as any).name;
        }
        return "—";
    };

    const filteredClasses = useMemo(() => {
        if (!searchQuery.trim()) return classes;
        const query = searchQuery.toLowerCase();
        return classes.filter((cls) => {
            const prog = getProgramName(cls).toLowerCase();
            const dept = getDepartmentName(cls).toLowerCase();
            return (
                cls.class_name.toLowerCase().includes(query) ||
                (cls.group && cls.group.toLowerCase().includes(query)) ||
                (prog !== "—" && prog.includes(query)) ||
                (dept !== "—" && dept.includes(query))
            );
        });
    }, [classes, searchQuery, programs, departments]);

    const paginatedClasses = filteredClasses;
    const canGoNext = totalPages ? currentPage < totalPages : classes.length === PAGE_SIZE;

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set("page", String(page));
        router.push(`?${params.toString()}`);
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
    };

    const handleEditClick = (cls: TClass) => {
        setClassToEdit(cls);
        setEditDialogOpen(true);
    };

    const handleDeleteClick = (cls: TClass) => {
        setClassToDelete(cls);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!classToDelete) return;

        startTransition(async () => {
            const response = await deleteClass(classToDelete.id);

            if (!response.success) {
                toast.error(response.message ?? "Failed to delete class");
                return;
            }
            toast.success(response.message ?? "Class deleted successfully");
            setDeleteDialogOpen(false);
            setClassToDelete(null);

            // Step back a page if the last row on this page was just removed
            if (paginatedClasses.length === 1 && currentPage > 1) {
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
                    <CardTitle className="text-lg font-semibold">Classes</CardTitle>
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search classes..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="h-9 pl-8 text-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {paginatedClasses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <GraduationCap className="mb-3 h-10 w-10 text-muted-foreground/50" />
                            <p className="text-sm font-medium text-muted-foreground">
                                {searchQuery
                                    ? "No classes match your search."
                                    : "No classes found."}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground/60">
                                {searchQuery
                                    ? "Try a different search term."
                                    : "Add a class to get started."}
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
                                                Class Name
                                                <ArrowUpDown className="h-3 w-3" />
                                            </span>
                                        </TableHead>
                                        {isSchool ? (
                                            <>
                                                <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                    Level
                                                </TableHead>
                                                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                    Group
                                                </TableHead>
                                            </>
                                        ) : (
                                            <>
                                                <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                    Year
                                                </TableHead>
                                                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                    Program
                                                </TableHead>
                                                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                    Department
                                                </TableHead>
                                            </>
                                        )}
                                        <TableHead className="h-10 w-24 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedClasses.map((cls, index) => (
                                        <TableRow
                                            key={cls.id}
                                            className="group transition-colors hover:bg-muted/20"
                                        >
                                            <TableCell className="text-center text-xs text-muted-foreground">
                                                {(currentPage - 1) * PAGE_SIZE + index + 1}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {cls.class_name}
                                            </TableCell>
                                            {isSchool ? (
                                                <>
                                                    <TableCell className="text-center">
                                                        <span className="inline-flex items-center rounded-md bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                                            {cls.class_level}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {cls.group ?? "—"}
                                                    </TableCell>
                                                </>
                                            ) : (
                                                <>
                                                    <TableCell className="text-center text-xs text-muted-foreground">
                                                        {cls.year_level ?? "—"}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {getProgramName(cls)}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {getDepartmentName(cls)}
                                                    </TableCell>
                                                </>
                                            )}
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:opacity-100"
                                                        title="Edit class"
                                                        onClick={() => handleEditClick(cls)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:text-destructive hover:opacity-100"
                                                        title="Delete class"
                                                        disabled={isPending && classToDelete?.id === cls.id}
                                                        onClick={() => handleDeleteClick(cls)}
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
                                    Showing{" "}
                                    <span className="font-medium">
                                        {Math.min(
                                            (currentPage - 1) * PAGE_SIZE + 1,
                                            totalItems
                                        )}
                                    </span>{" "}
                                    to{" "}
                                    <span className="font-medium">
                                        {Math.min(currentPage * PAGE_SIZE, totalItems)}
                                    </span>{" "}
                                    of <span className="font-medium">{totalItems}</span> classes
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={currentPage <= 1}
                                        onClick={() => handlePageChange(currentPage - 1)}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-xs text-muted-foreground">
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
                title="Delete Class"
                description={
                    classToDelete
                        ? `Are you sure you want to delete "${classToDelete.class_name}"? This action cannot be undone.`
                        : "Are you sure you want to delete this class? This action cannot be undone."
                }
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="destructive"
                isPending={isPending}
                onConfirm={handleDeleteConfirm}
            />

            <EditClassDialog
                classData={classToEdit}
                institution={institution}
                programs={programs}
                departments={departments}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                onClassUpdated={onClassUpdated}
            />
        </>
    );
};

export default ClassTable;
