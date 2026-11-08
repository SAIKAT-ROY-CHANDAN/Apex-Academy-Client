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
import { TDepositType } from './Types/deposit-type';
import { DepositTypeFormValues } from './schema/deposit-type.schema';
import DepositTypeForm from './DepositTypeForm';
import { createDepositType } from '@/services/depositType';

interface AddDepositTypeDialogProps {
    onDepositTypeCreated?: (newDepositType: TDepositType) => void;
}

const AddDepositTypeDialog = ({ onDepositTypeCreated }: AddDepositTypeDialogProps) => {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (values: DepositTypeFormValues) => {
        try {
            setIsSubmitting(true);
            const newDepositType = await createDepositType({
                name: values.name,
            });

            if (newDepositType?.success) {
                toast.success('Deposit type created successfully');
                onDepositTypeCreated?.(newDepositType.data);
                setOpen(false);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to create deposit type');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="group inline-flex h-11 items-center gap-2 rounded-2xl border border-white/20 bg-white/70 px-5 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary hover:text-white hover:shadow-primary/20 active:scale-95 dark:bg-white/10 dark:text-slate-200"
            >
                <Plus className="mr-2 h-4 w-4" />
                Add Deposit Type
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="space-y-1 border-b pb-4">
                    <DialogTitle className="text-xl font-semibold">Add New Deposit Type</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create a new deposit type.
                    </DialogDescription>
                </DialogHeader>
                <div className="pt-2">
                    <DepositTypeForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddDepositTypeDialog;