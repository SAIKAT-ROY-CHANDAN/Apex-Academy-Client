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
import { TDepositType } from '../../deposit-type/_components/Types/deposit-type';
import { TDeposit } from './types/deposit';
import { DepositFormValues } from './schema/deposit.schema';
import DepositForm from './DepositForm';
import { createDeposit } from '@/services/deposit';

interface AddDepositDialogProps {
    depositTypes: TDepositType[];
    onDepositCreated?: (newDeposit: TDeposit) => void;
}

const DepositDialog = ({ depositTypes, onDepositCreated }: AddDepositDialogProps) => {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (values: DepositFormValues) => {
        try {
            setIsSubmitting(true);
            const newDeposit = await createDeposit(values);
         
            if (newDeposit?.success) {
                toast.success('Deposit created successfully');
                onDepositCreated?.(newDeposit.data);
                setOpen(false);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to create deposit');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="group inline-flex h-11 items-center gap-2 rounded-2xl border border-white/20 bg-white/70 px-5 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary hover:text-white hover:shadow-primary/20 active:scale-95 dark:bg-white/10 dark:text-slate-200"
            >
                <Plus className="mr-2 h-4 w-4" />
                Add Deposit
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader className="space-y-1 border-b pb-4">
                    <DialogTitle className="text-xl font-semibold">Add New Deposit</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create a new deposit.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto pt-2">
                    <DepositForm
                        depositTypes={depositTypes}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DepositDialog;