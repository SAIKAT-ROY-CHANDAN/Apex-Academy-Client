import React from 'react';
import ExpenseTypeConfiguration from './_components/ExpenseTypeConfiguration';
import ExpenseTypeTable from './_components/ExpenseTypeTable';
import { getExpenseTypes } from '@/services/expenseType';

const PAGE_SIZE = 10;

const ExpenseType = async ({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) => {
    const resolvedSearchParams = await searchParams;
    const pageParam = Array.isArray(resolvedSearchParams.page) ? resolvedSearchParams.page[0] : resolvedSearchParams.page;
    const currentPage = Math.max(1, Number(pageParam ?? 1) || 1);

    const expenseTypes = await getExpenseTypes([
        { label: 'page', value: currentPage },
        { label: 'limit', value: PAGE_SIZE },
    ])
    const items = expenseTypes?.data ?? [];
    const totalItems = expenseTypes?.meta?.total ?? expenseTypes?.meta?.totalItems ?? items.length;
    const totalPages = expenseTypes?.meta?.totalPages ?? expenseTypes?.meta?.lastPage ?? expenseTypes?.meta?.last_page;
    return (
        <div>
            <ExpenseTypeConfiguration />
            <ExpenseTypeTable expenseTypes={items} currentPage={currentPage} totalItems={totalItems} totalPages={totalPages} />
        </div>
    );
};

export default ExpenseType;
