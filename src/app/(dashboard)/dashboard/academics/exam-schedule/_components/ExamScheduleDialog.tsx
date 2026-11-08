'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { TExamConfig } from '@/app/(dashboard)/dashboard/academics/manage-exam/_components/types/exam-config';
import { TSubject } from '@/app/(dashboard)/dashboard/settings/system/subject-config/_components/types';
import { TClass } from '@/app/(dashboard)/dashboard/settings/system/class-config/_components/types/types';
import { Program } from '@/app/(dashboard)/dashboard/settings/system/program-config/_components/types/type';
import { ExamScheduleFormValues } from './schema/exam-schedule.schema';
import ExamScheduleForm from './ExamScheduleForm';
import { createExamSchedule } from '@/services/examSchedule';

interface AddExamScheduleDialogProps {
    exams: TExamConfig[];
    subjects: TSubject[];
    classes: TClass[];
    programs: Program[];
    onScheduleCreated?: (newSchedule: any) => void;
}

const ExamScheduleDialog = ({ exams, subjects, classes, programs, onScheduleCreated }: AddExamScheduleDialogProps) => {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (values: ExamScheduleFormValues) => {
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

            const newSchedule = await createExamSchedule(payload);

            if (newSchedule?.success) {
                toast.success("Exam schedule created successfully");
                onScheduleCreated?.(newSchedule.data);
                setOpen(false);
            } else {
                toast.error(newSchedule?.message || "Failed to create exam schedule");
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to create exam schedule");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="group inline-flex h-11 items-center gap-2 rounded-2xl border border-white/20 bg-white/70 px-5 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary hover:text-white hover:shadow-primary/20 active:scale-95 dark:bg-white/10 dark:text-slate-200"
            >
                <Plus className="mr-2 h-4 w-4" />
                Create Routine
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-1 border-b pb-4">
                    <DialogTitle className="text-xl font-semibold">Create Routine</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create a new exam schedule.
                    </DialogDescription>
                </DialogHeader>
                <div className="pt-2">
                    <ExamScheduleForm
                        exams={exams}
                        subjects={subjects}
                        classes={classes}
                        programs={programs}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ExamScheduleDialog;