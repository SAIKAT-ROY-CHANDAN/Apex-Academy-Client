"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { TExamSchedule } from "./types/exam-schedule";
import { TExamConfig } from "@/app/(dashboard)/dashboard/academics/manage-exam/_components/types/exam-config";
import { TSubject } from "@/app/(dashboard)/dashboard/settings/system/subject-config/_components/types";
import { TClass } from "@/app/(dashboard)/dashboard/settings/system/class-config/_components/types/types";
import { Program } from "@/app/(dashboard)/dashboard/settings/system/program-config/_components/types/type";
import { toast } from "sonner";
import { updateExamSchedule } from "@/services/examSchedule";
import { ExamScheduleFormValues } from "./schema/exam-schedule.schema";
import ExamScheduleForm from "./ExamScheduleForm";

interface EditExamScheduleDialogProps {
    schedule: TExamSchedule | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    exams: TExamConfig[];
    subjects: TSubject[];
    classes: TClass[];
    programs: Program[];
}

const EditExamScheduleDialog = ({
    schedule,
    open,
    onOpenChange,
    exams,
    subjects,
    classes,
    programs,
}: EditExamScheduleDialogProps) => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (values: ExamScheduleFormValues) => {
        if (!schedule) return;

        try {
            setIsSubmitting(true);

            const examDate = values.examDate || new Date().toISOString().split("T")[0];

            let startTimeIso: string | null = null;
            let endTimeIso: string | null = null;

            if (values.startTime && values.startTime.includes(":")) {
                const [startHours, startMinutes] = values.startTime.split(":").map(Number);
                if (!isNaN(startHours) && !isNaN(startMinutes)) {
                    const d = new Date();
                    d.setFullYear(parseInt(examDate.split("-")[0]));
                    d.setMonth(parseInt(examDate.split("-")[1]) - 1);
                    d.setDate(parseInt(examDate.split("-")[2]));
                    d.setHours(startHours, startMinutes, 0, 0);
                    startTimeIso = d.toISOString();
                }
            }

            if (values.endTime && values.endTime.includes(":")) {
                const [endHours, endMinutes] = values.endTime.split(":").map(Number);
                if (!isNaN(endHours) && !isNaN(endMinutes)) {
                    const d = new Date();
                    d.setFullYear(parseInt(examDate.split("-")[0]));
                    d.setMonth(parseInt(examDate.split("-")[1]) - 1);
                    d.setDate(parseInt(examDate.split("-")[2]));
                    d.setHours(endHours, endMinutes, 0, 0);
                    endTimeIso = d.toISOString();
                }
            }

            const payload = {
                examConfigId: values.examConfigId,
                program_id: values.program_id,
                department_id: values.department_id,
                year: values.year,
                subjectId: values.subjectId,
                examTakenYear: values.examTakenYear,
                examDate: new Date(`${examDate}T00:00:00.000Z`).toISOString(),
                startTime: startTimeIso,
                endTime: endTimeIso,
                durationMinutes: values.durationMinutes,
                fullMarks: values.fullMarks,
                passMarks: values.passMarks,
            };

            const response = await updateExamSchedule(schedule.id, payload);

            if (response?.success) {
                toast.success("Exam schedule updated successfully");
                onOpenChange(false);
                router.refresh();
            } else {
                toast.error(response?.message || "Failed to update exam schedule");
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update exam schedule");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTimeForInput = (date: Date | string | undefined): string => {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const formatDateForInput = (date: Date | string | undefined): string => {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Exam Schedule</DialogTitle>
                </DialogHeader>
                {schedule && (
                    <ExamScheduleForm
                        key={schedule.id}
                        exams={exams}
                        subjects={subjects}
                        classes={classes}
                        programs={programs}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        isEditMode
                        defaultValues={{
                            examConfigId: schedule.examConfigId,
                            program_id: schedule.program_id || schedule.program?.id || '',
                            department_id: schedule.department_id || schedule.department?.id || '',
                            year: schedule.year ?? undefined,
                            subjectId: schedule.subjectId,
                            examTakenYear: schedule.examTakenYear,
                            examDate: formatDateForInput(schedule.examDate),
                            startTime: formatTimeForInput(schedule.startTime),
                            endTime: formatTimeForInput(schedule.endTime),
                            durationMinutes: schedule.durationMinutes,
                            fullMarks: schedule.fullMarks,
                            passMarks: schedule.passMarks,
                        }}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};

export default EditExamScheduleDialog;