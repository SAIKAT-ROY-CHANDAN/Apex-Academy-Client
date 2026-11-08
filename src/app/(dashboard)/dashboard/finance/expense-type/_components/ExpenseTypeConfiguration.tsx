'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { TExpenseType } from './Types/expense-type';
import AddExpenseTypeDialog from './ExpenseTypeDialog';

const ExpenseTypeConfiguration = () => {
    const [expenseTypes, setExpenseTypes] = useState<TExpenseType[]>([]);

    const handleExpenseTypeCreated = (newExpenseType: TExpenseType) => {
        setExpenseTypes((prev) => [...prev, newExpenseType]);
    };

    return (
        <div className="space-y-4">
            <PageHeader title="Expense Types" backHref="/dashboard/finance" components={<AddExpenseTypeDialog
                onExpenseTypeCreated={handleExpenseTypeCreated}
            />} />

         </div>
    );
};

export default ExpenseTypeConfiguration;