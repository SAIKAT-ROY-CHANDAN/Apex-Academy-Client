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
import { Holiday } from './types';
import { HolidayFormValues } from './schema/holiday.schema';
import HolidayForm from './HolidayForm';
import { createHoliday } from '@/services/holiday';

interface AddHolidayDialogProps {
    onHolidayCreated?: (newHoliday: Holiday) => void;
}

const AddHolidayDialog = ({ onHolidayCreated }: AddHolidayDialogProps) => {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (values: HolidayFormValues) => {
        try {
            setIsSubmitting(true);
            const newHoliday = await createHoliday({
                ...values,
                end_date: values.end_date == "" ? undefined : values.end_date,
            });
            console.log(newHoliday, "newHoliday");

            if (newHoliday?.success) {
                toast.success('Holiday created successfully');
                onHolidayCreated?.(newHoliday.data);
                setOpen(false);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to create holiday');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen} >
            <DialogTrigger className="group inline-flex h-11 items-center gap-2 rounded-2xl border border-white/20 bg-white/70 px-5 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary hover:text-white hover:shadow-primary/20 active:scale-95 dark:bg-white/10 dark:text-slate-200"
            > <Plus className="mr-2 h-4 w-4" />
                Add holiday
            </DialogTrigger>
            {/* changeable part */}
            <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0">
                <DialogHeader className="sticky top-0 z-10 border-b bg-background px-6 py-4">
                    <DialogTitle>Add New Holiday</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create a new holiday.
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[calc(90vh-90px)] overflow-y-auto px-6 py-4">
                    <HolidayForm
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddHolidayDialog;