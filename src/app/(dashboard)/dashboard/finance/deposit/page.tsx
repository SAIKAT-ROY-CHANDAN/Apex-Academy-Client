import DepositConfiguration from './_components/DepositConfiguration';
import DepositTable from './_components/DepositTable';
import { getDeposits } from '@/services/deposit';

const PAGE_SIZE = 10;

const Deposit = async ({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) => {
    const resolvedSearchParams = await searchParams;
    const pageParam = Array.isArray(resolvedSearchParams.page) ? resolvedSearchParams.page[0] : resolvedSearchParams.page;
    const currentPage = Math.max(1, Number(pageParam ?? 1) || 1);

    const deposits = await getDeposits([
        { label: 'page', value: currentPage },
        { label: 'limit', value: PAGE_SIZE },
    ]);

    const items = deposits?.data ?? [];
    const totalItems = deposits?.meta?.total ?? deposits?.meta?.totalItems ?? items.length;
    const totalPages = deposits?.meta?.totalPages ?? deposits?.meta?.lastPage ?? deposits?.meta?.last_page;
    return (
        <div>
            <DepositConfiguration />
            <DepositTable
                deposits={items}
                currentPage={currentPage}
                totalItems={totalItems}
                totalPages={totalPages}
            />
        </div>
    );
};

export default Deposit;