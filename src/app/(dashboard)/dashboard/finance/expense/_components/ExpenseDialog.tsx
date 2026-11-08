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
import { TExpenseType } from '../../expense-type/_components/Types/expense-type';
import { TExpense } from './types/expense';
import { ExpenseFormValues } from './schema/expense.schema';
import ExpenseForm from './ExpenseForm';
import { createExpense } from '@/services/expense';

interface AddExpenseDialogProps {
    expenseTypes: TExpenseType[];
    onExpenseCreated?: (newExpense: TExpense) => void;
}

const ExpenseDialog = ({ expenseTypes, onExpenseCreated }: AddExpenseDialogProps) => {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatDateToISO = (dateStr: string): string => {
        const raw = dateStr.trim();
        // Already ISO (YYYY-MM-DD, optionally with time) — send date part as-is.
        const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
        // DD-MM-YYYY (the field's contract) -> YYYY-MM-DD. Never send
        // DD-MM-YYYY raw — `new Date()` parses it as MM-DD-YYYY.
        const dmyMatch = raw.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
        if (dmyMatch) {
            const [, dd, mm, yyyy] = dmyMatch;
            return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
        }
        return raw;
    };

    const handleSubmit = async (values: ExpenseFormValues) => {
        try {
            setIsSubmitting(true);
            // Transform date from DD-MM-YYYY to YYYY-MM-DD
            const transformedValues = {
                ...values,
                expense_date: values.expense_date ? formatDateToISO(values.expense_date) : values.expense_date,
            };
            const newExpense = await createExpense({
                ...transformedValues,
            });
            if (newExpense?.success) {
                toast.success('Expense created successfully');
                onExpenseCreated?.(newExpense.data);
                setOpen(false);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to create expense');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="group inline-flex h-11 items-center gap-2 rounded-2xl border border-white/20 bg-white/70 px-5 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary hover:text-white hover:shadow-primary/20 active:scale-95 dark:bg-white/10 dark:text-slate-200"
            >
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader className="space-y-1 border-b pb-4">
                    <DialogTitle className="text-xl font-semibold">Add New Expense</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create a new expense.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto pt-2">
                    <ExpenseForm
                        expenseTypes={expenseTypes}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ExpenseDialog;