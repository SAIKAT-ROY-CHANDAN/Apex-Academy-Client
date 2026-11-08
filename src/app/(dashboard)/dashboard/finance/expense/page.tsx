import ExpenseConfiguration from './_components/ExpenseConfiguration';
import ExpenseTable from './_components/ExpenseTable';
import { getExpenses } from '@/services/expense';

const PAGE_SIZE = 10;

const Expense = async ({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) => {
    const resolvedSearchParams = await searchParams;
    const pageParam = Array.isArray(resolvedSearchParams.page) ? resolvedSearchParams.page[0] : resolvedSearchParams.page;
    const currentPage = Math.max(1, Number(pageParam ?? 1) || 1);

    const expenses = await getExpenses([
        { label: 'page', value: currentPage },
        { label: 'limit', value: PAGE_SIZE },
    ]);

    const items = expenses?.data ?? [];
    const totalItems = expenses?.meta?.total ?? expenses?.meta?.totalItems ?? items.length;
    const totalPages = expenses?.meta?.totalPages ?? expenses?.meta?.lastPage ?? expenses?.meta?.last_page;
    return (
        <div>
            <ExpenseConfiguration />
            <ExpenseTable
                expenses={items}
                currentPage={currentPage}
                totalItems={totalItems}
                totalPages={totalPages}
            />
        </div>
    );
};

export default Expense;
