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
import { Program } from '@/app/(dashboard)/dashboard/settings/system/program-config/_components/types/type';
import { ExamConfigFormValues, toExamConfigPayload } from './schema/exam-config.schema';
import ExamConfigForm from './ExamConfigForm';
import { createExamConfig } from '@/services/examConfig';
import { isConflictResponse } from '@/types/shared/api-response.type';
import { toast } from 'sonner';

interface AddExamConfigDialogProps {
    programs: Program[];
    onExamCreated?: (newExam: any) => void;
}

const ExamConfigDialog = ({ programs, onExamCreated }: AddExamConfigDialogProps) => {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [duplicateError, setDuplicateError] = useState<string | null>(null);
    // Bumped to remount the form (resetting Section and all fields) when the
    // dialog closes or after a successful create.
    const [formKey, setFormKey] = useState(0);

    const handleOpenChange = (next: boolean) => {
        if (!next) {
            setDuplicateError(null);
            setFormKey((k) => k + 1);
        }
        setOpen(next);
    };

    const handleSubmit = async (values: ExamConfigFormValues) => {
        setDuplicateError(null);
        try {
            setIsSubmitting(true);
            const newExam = await createExamConfig(toExamConfigPayload(values));

            if (newExam?.success) {
                toast.success('Exam created successfully');
                onExamCreated?.(newExam.data);
                setOpen(false);
                setFormKey((k) => k + 1);
            } else {
                // Keep the dialog open with the entered values so the user can
                // change something and retry. 409 = duplicate exam.
                const message = newExam?.message || 'Failed to create exam';
                toast.error(message);
                if (isConflictResponse(newExam)) {
                    setDuplicateError(message);
                }
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to create exam');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger className="group inline-flex h-11 items-center gap-2 rounded-2xl border border-white/20 bg-white/70 px-5 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary hover:text-white hover:shadow-primary/20 active:scale-95 dark:bg-white/10 dark:text-slate-200"
            >
                <Plus className="mr-2 h-4 w-4" />
                Create Exam
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader className="space-y-1 border-b pb-4">
                    <DialogTitle className="text-xl font-semibold">Create New Exam</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create a new exam configuration.
                    </DialogDescription>
                </DialogHeader>
                <div className="pt-2">
                    <ExamConfigForm
                        key={formKey}
                        programs={programs}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        serverError={duplicateError}
                        onServerErrorClear={() => setDuplicateError(null)}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ExamConfigDialog;