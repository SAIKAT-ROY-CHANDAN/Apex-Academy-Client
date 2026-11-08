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

import { deleteExamSchedule } from "@/services/examSchedule";
import {
    Search,
    ArrowUpDown,
    Trash2,
    ChevronLeft,
    ChevronRight,
    FileText,
    Download,
    Edit,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo, useTransition } from "react";
import { toast } from "sonner";
import { TExamSchedule } from "./types/exam-schedule";
import { TExamConfig } from "@/app/(dashboard)/dashboard/academics/manage-exam/_components/types/exam-config";
import { TSubject } from "@/app/(dashboard)/dashboard/settings/system/subject-config/_components/types";
import { TClass } from "@/app/(dashboard)/dashboard/settings/system/class-config/_components/types/types";
import { Program } from "@/app/(dashboard)/dashboard/settings/system/program-config/_components/types/type";
import EditExamScheduleDialog from "./EditExamScheduleDialog";

interface ExamScheduleTableProps {
    schedules: TExamSchedule[] | [];
    currentPage: number;
    totalItems: number;
    totalPages?: number;
    exams: TExamConfig[];
    subjects: TSubject[];
    classes: TClass[];
    programs: Program[];
}

const PAGE_SIZE = 10;

const ExamScheduleTable = ({
    schedules,
    currentPage,
    totalItems,
    totalPages,
    exams,
    subjects,
    classes,
    programs,
}: ExamScheduleTableProps) => {
    const [searchQuery, setSearchQuery] = useState("");

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [scheduleToDelete, setScheduleToDelete] = useState<TExamSchedule | null>(null);

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [scheduleToEdit, setScheduleToEdit] = useState<TExamSchedule | null>(null);

    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const getProgramName = (schedule: TExamSchedule) => {
        const programId = schedule.program_id ?? schedule.program?.id;

        if (programId == null) return "—";

        return (
            programs.find((program) => String(program.id) === String(programId))?.program_name ||
            schedule.program?.program_name ||
            "—"
        );
    };

    const getDepartmentName = (schedule: TExamSchedule) => {
        return schedule.department?.department_name || "—";
    };

    const getYear = (schedule: TExamSchedule) => {
        return schedule.year ?? "—";
    };

    const filteredSchedules = useMemo(() => {
        if (!searchQuery.trim()) return schedules;
        const query = searchQuery.toLowerCase();
        return schedules.filter(
            (schedule) =>
                schedule.subject?.name?.toLowerCase().includes(query) ||
                schedule.examConfig?.exam_name?.toLowerCase().includes(query) ||
                getProgramName(schedule).toLowerCase().includes(query) ||
                getDepartmentName(schedule).toLowerCase().includes(query) ||
                schedule.examDate?.toLowerCase().includes(query) ||
                String(schedule.examTakenYear ?? "").includes(query)
        );
    }, [schedules, searchQuery, programs]);

    const paginatedSchedules = filteredSchedules;
    const canGoNext = totalPages ? currentPage < totalPages : schedules.length === PAGE_SIZE;

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set("page", String(page));
        router.push(`?${params.toString()}`);
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
    };

    const handleExport = () => {
        const csvContent = paginatedSchedules.map(schedule => ({
            'Exam': schedule.examConfig?.exam_name || '—',
            'Program': getProgramName(schedule),
            'Department': getDepartmentName(schedule),
            'Year': getYear(schedule),
            'Subject': schedule.subject?.name || '—',
            'Exam Taken Year': schedule.examTakenYear ?? '—',
            'Date': formatDate(schedule.examDate),
            'Start Time': schedule.startTime,
            'End Time': schedule.endTime,
            'Duration (Min)': schedule.durationMinutes,
            'Full Marks': schedule.fullMarks,
            'Pass Marks': schedule.passMarks,
        }));

        const csvString = [
            Object.keys(csvContent[0] || {}).join(','),
            ...csvContent.map(row => Object.values(row).join(','))
        ].join('\n');

        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `exam-schedules-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        toast.success('Exam schedules exported successfully');
    };

    const handleEditClick = (schedule: TExamSchedule) => {
        setScheduleToEdit(schedule);
        setEditDialogOpen(true);
    };

    const handleDeleteClick = (schedule: TExamSchedule) => {
        setScheduleToDelete(schedule);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!scheduleToDelete) return;

        startTransition(async () => {
            const response = await deleteExamSchedule(scheduleToDelete.id);

            if (!response.success) {
                toast.error(response.message ?? "Failed to delete exam schedule");
                return;
            }
            toast.success(response.message ?? "Exam schedule deleted successfully");
            setDeleteDialogOpen(false);
            setScheduleToDelete(null);

            if (paginatedSchedules.length === 1 && currentPage > 1) {
                handlePageChange(currentPage - 1);
                return;
            }
            router.refresh();
        });
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatTime = (timeString: string | undefined) => {
        if (!timeString) return "—";

        if (timeString.includes("T")) {
            const d = new Date(timeString);
            if (isNaN(d.getTime())) return "—";
            return d.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
        }

        const match = timeString.match(/^(\d{1,2}):(\d{2})$/);
        if (!match) return "—";
        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const d = new Date();
        d.setHours(hours, minutes, 0, 0);
        return d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    return (
        <>
            <Card className="border-border/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
                    <CardTitle className="text-lg font-semibold">Exam Schedules</CardTitle>
                    <div className="flex items-center gap-2">
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search schedules..."
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
                    {paginatedSchedules.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
                            <p className="text-sm font-medium text-muted-foreground">
                                {searchQuery
                                    ? "No schedules match your search."
                                    : "No exam schedules found."}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground/60">
                                {searchQuery
                                    ? "Try a different search term."
                                    : "Create an exam schedule to get started."}
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
                                                Exam
                                                <ArrowUpDown className="h-3 w-3" />
                                            </span>
                                        </TableHead>
                                        <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Program
                                        </TableHead>
                                        <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Department
                                        </TableHead>
                                        <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Year
                                        </TableHead>
                                        <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Subject
                                        </TableHead>
                                        <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Exam Taken Year
                                        </TableHead>
                                        <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Date
                                        </TableHead>
                                        <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Time
                                        </TableHead>
                                        <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Duration
                                        </TableHead>
                                        <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Full Marks
                                        </TableHead>
                                        <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Pass Marks
                                        </TableHead>
                                        <TableHead className="h-10 w-24 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedSchedules.map((schedule, index) => (
                                        <TableRow
                                            key={schedule.id}
                                            className="group transition-colors hover:bg-muted/20"
                                        >
                                            <TableCell className="text-center text-xs text-muted-foreground">
                                                {(currentPage - 1) * PAGE_SIZE + index + 1}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {schedule.examConfig?.exam_name || "—"}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {getProgramName(schedule)}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {getDepartmentName(schedule)}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {getYear(schedule)}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {schedule.subject?.name || "—"}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {schedule.examTakenYear ?? "—"}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {formatDate(schedule.examDate)}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {schedule.durationMinutes || "—"}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {schedule.fullMarks || "—"}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {schedule.passMarks || "—"}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:opacity-100"
                                                        title="Edit schedule"
                                                        onClick={() => handleEditClick(schedule)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:text-destructive hover:opacity-100"
                                                        onClick={() => handleDeleteClick(schedule)}
                                                        title="Delete schedule"
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
                                        ? `Showing ${filteredSchedules.length} matching schedule${filteredSchedules.length === 1 ? "" : "s"}`
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
                title="Delete Exam Schedule"
                description={
                    scheduleToDelete
                        ? `Are you sure you want to delete this exam schedule? This action cannot be undone.`
                        : "Are you sure you want to delete this exam schedule? This action cannot be undone."
                }
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="destructive"
                isPending={isPending}
                onConfirm={handleDeleteConfirm}
            />

            {scheduleToEdit && (
                <EditExamScheduleDialog
                    schedule={scheduleToEdit}
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    exams={exams}
                    subjects={subjects}
                    classes={classes}
                    programs={programs}
                />
            )}
        </>
    );
};

export default ExamScheduleTable;