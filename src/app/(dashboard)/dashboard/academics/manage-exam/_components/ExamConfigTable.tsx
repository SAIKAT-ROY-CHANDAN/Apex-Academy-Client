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

import { deleteExamConfig } from "@/services/examConfig";
import EditExamConfigDialog from "./EditExamConfigDialog";
import {
    Edit,
    Search,
    ArrowUpDown,
    Trash2,
    ChevronLeft,
    ChevronRight,
    FileText,
    Download,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo, useTransition } from "react";
import { toast } from "sonner";
import { TExamConfig } from "./types/exam-config";
import { TClass } from "@/app/(dashboard)/dashboard/settings/system/class-config/_components/types/types";
import { Program } from "@/app/(dashboard)/dashboard/settings/system/program-config/_components/types/type";

interface ExamConfigTableProps {
    exams: TExamConfig[] | [];
    currentPage: number;
    totalItems: number;
    totalPages?: number;
    classes: TClass[];
    programs: Program[];
    onChanged?: () => void;
}

const PAGE_SIZE = 10;

const ExamConfigTable = ({ exams, currentPage, totalItems, totalPages, classes, programs, onChanged }: ExamConfigTableProps) => {
    const [searchQuery, setSearchQuery] = useState("");

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [examToDelete, setExamToDelete] = useState<TExamConfig | null>(null);

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [examToEdit, setExamToEdit] = useState<TExamConfig | null>(null);

    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // academicClass is nested on exam
    const getExamClass = (exam: TExamConfig) =>
        exam.academicClass ?? classes.find((classItem) => classItem.id === exam.academic_class_id);

    // program & department are TOP-LEVEL fields on exam (siblings of academicClass),
    // matching the backend's `include: { academicClass, program, department, batch, section }`
    const getExamProgram = (exam: TExamConfig) =>
        exam.program ?? programs.find((p) => p.id === exam.program_id);

    const getExamDepartment = (exam: TExamConfig) => exam.department;

    // The exam's own section (section_id), included by the list API.
    // Exams without a section show "—".
    const getExamSectionName = (exam: TExamConfig): string | null =>
        exam.section?.section_name ?? null;

    const filteredExams = useMemo(() => {
        if (!searchQuery.trim()) return exams;
        const query = searchQuery.toLowerCase();
        return exams.filter(
            (exam) =>
                exam.exam_name.toLowerCase().includes(query) ||
                getExamClass(exam)?.class_name.toLowerCase().includes(query) ||
                getExamProgram(exam)?.program_name.toLowerCase().includes(query) ||
                getExamDepartment(exam)?.department_name.toLowerCase().includes(query) ||
                (getExamSectionName(exam)?.toLowerCase().includes(query) ?? false)
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [exams, searchQuery]);

    const paginatedExams = filteredExams;
    const canGoNext = totalPages ? currentPage < totalPages : exams.length === PAGE_SIZE;

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set("page", String(page));
        router.push(`?${params.toString()}`);
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
    };

    const handleExport = () => {
        const csvContent = paginatedExams.map((exam) => {
            const examClass = getExamClass(exam);
            return {
                "Exam Name": exam.exam_name,
                Class: examClass?.class_name || "—",
                Department: getExamDepartment(exam)?.department_name || "—",
                Program: getExamProgram(exam)?.program_name || "—",
                Section: getExamSectionName(exam) ?? "—",
                "Exam Date": formatDate(exam.exam_date),
            };
        });

        const csvString = [
            Object.keys(csvContent[0] || {}).join(","),
            ...csvContent.map((row) => Object.values(row).join(",")),
        ].join("\n");

        const blob = new Blob([csvString], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `exams-${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);

        toast.success("Exams exported successfully");
    };

    const handleEditClick = (exam: TExamConfig) => {
        setExamToEdit(exam);
        setEditDialogOpen(true);
    };

    const handleDeleteClick = (exam: TExamConfig) => {
        setExamToDelete(exam);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!examToDelete) return;

        startTransition(async () => {
            const response = await deleteExamConfig(examToDelete.id);

            if (!response.success) {
                toast.error(response.message ?? "Failed to delete exam");
                return;
            }
            toast.success(response.message ?? "Exam deleted successfully");
            setDeleteDialogOpen(false);
            setExamToDelete(null);

            if (paginatedExams.length === 1 && currentPage > 1) {
                handlePageChange(currentPage - 1);
                onChanged?.();
                return;
            }
            router.refresh();
            onChanged?.();
        });
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <>
            <Card className="border-border/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
                    <CardTitle className="text-lg font-semibold">Exams</CardTitle>
                    <div className="flex items-center gap-2">
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search exams..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="h-9 pl-8 text-sm"
                            />
                        </div>
                        <Button
                            onClick={handleExport}
                            className="h-9 bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90"
                        >
                            <Download className="mr-2 h-3.5 w-3.5" />
                            Export
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {paginatedExams.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
                            <p className="text-sm font-medium text-muted-foreground">
                                {searchQuery ? "No exams match your search." : "No exams found."}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground/60">
                                {searchQuery ? "Try a different search term." : "Create an exam to get started."}
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
                                                Exam Name
                                                <ArrowUpDown className="h-3 w-3" />
                                            </span>
                                        </TableHead>
                                        <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Class/Year
                                        </TableHead>
                                        <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Department
                                        </TableHead>
                                        <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Program
                                        </TableHead>
                                        <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Section
                                        </TableHead>
                                        <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Exam Date
                                        </TableHead>
                                        <TableHead className="h-10 w-24 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedExams.map((exam, index) => {
                                        const examClass = getExamClass(exam);
                                        const examProgram = getExamProgram(exam);
                                        const examDepartment = getExamDepartment(exam);
                                        const sectionName = getExamSectionName(exam);

                                        return (
                                            <TableRow
                                                key={exam.id}
                                                className="group transition-colors hover:bg-muted/20"
                                            >
                                                <TableCell className="text-center text-xs text-muted-foreground">
                                                    {(currentPage - 1) * PAGE_SIZE + index + 1}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {exam.exam_name}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {examClass?.class_name ?? "—"}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {examDepartment?.department_name || "—"}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {examProgram?.program_name ?? "—"}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {sectionName ?? "—"}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {formatDate(exam.exam_date)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:opacity-100"
                                                            title="Edit exam"
                                                            onClick={() => handleEditClick(exam)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>

                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:text-destructive hover:opacity-100"
                                                            onClick={() => handleDeleteClick(exam)}
                                                            title="Delete exam"
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

                            <div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
                                <p className="text-xs text-muted-foreground">
                                    {searchQuery
                                        ? `Showing ${filteredExams.length} matching exam${filteredExams.length === 1 ? "" : "s"}`
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
                title="Delete Exam"
                description={
                    examToDelete
                        ? `Are you sure you want to delete "${examToDelete.exam_name}"? This action cannot be undone.`
                        : "Are you sure you want to delete this exam? This action cannot be undone."
                }
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="destructive"
                isPending={isPending}
                onConfirm={handleDeleteConfirm}
            />

            {examToEdit && (
                <EditExamConfigDialog
                    exam={examToEdit}
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    programs={programs}
                    onUpdated={() => onChanged?.()}
                />
            )}
        </>
    );
};

export default ExamConfigTable;
