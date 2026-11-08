'use client';

import { useEffect, useState } from 'react';
import { getExpenseTypes } from '@/services/expenseType';
import { TExpenseType } from '../../expense-type/_components/Types/expense-type';
import { TExpense } from './types/expense';
import { PageHeader } from '@/components/shared/page-header';
import ExpenseDialog from './ExpenseDialog';

const ExpenseConfiguration = () => {
    const [expenses, setExpenses] = useState<TExpense[]>([]);
    const [expenseTypes, setExpenseTypes] = useState<TExpenseType[]>([]);

    const handleExpenseCreated = (newExpense: TExpense) => {
        setExpenses((prev) => [...prev, newExpense]);
    };

    useEffect(() => {
        const fetchExpenseTypes = async () => {
            try {
                const expenseTypeData = await getExpenseTypes();
                setExpenseTypes(expenseTypeData?.data);
            } catch (error) {
                console.error("Error fetching expense types:", error);
            }
        };

        fetchExpenseTypes();
    }, []);

    return (
        <div className="space-y-4">
            <PageHeader title="Expenses" backHref="/dashboard/finance" components={<ExpenseDialog expenseTypes={expenseTypes} onExpenseCreated={handleExpenseCreated} />} />

        </div>
    );
};

export default ExpenseConfiguration;