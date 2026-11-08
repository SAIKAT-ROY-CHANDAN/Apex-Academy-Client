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
import AcademicSessionForm from './academic-session-form';
import { toast } from 'sonner';
import { AcademicSession } from './types/academic-session';
import { AcademicSessionFormValues } from './validations/academic-session.schema';
import { createAcademicSession } from '@/services/academicSession';

interface AddAcademicSessionDialogProps {
    institutionId?: string | null;
    onSessionCreated?: (newSession: AcademicSession) => void;
}

const AcademicSessionDialog = ({
    institutionId,
    onSessionCreated,
}: AddAcademicSessionDialogProps) => {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (values: AcademicSessionFormValues) => {
        if (!institutionId) {
            toast.error('Institution not found');
            return;
        }

        try {
            setIsSubmitting(true);
            const newSession = await createAcademicSession({
                ...values,
                institution_id: institutionId,
            });
            console.log(newSession,"newSessionnewSessionnewSession");
            
            if (newSession?.success) {
                toast.success('Academic session created successfully');
                onSessionCreated?.(newSession);
                setOpen(false);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to create session');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="group inline-flex h-11 items-center gap-2 rounded-2xl border border-white/20 bg-white/70 px-5 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary hover:text-white hover:shadow-primary/20 active:scale-95 dark:bg-white/10 dark:text-slate-200">
                <Plus className="mr-2 h-4 w-4" />
                Add session
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="space-y-1 border-b pb-4">
                    <DialogTitle className="text-xl font-semibold">Add New Academic Session</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create a new academic session.
                    </DialogDescription>
                </DialogHeader>
                <div className="pt-2">
                    <AcademicSessionForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AcademicSessionDialog;