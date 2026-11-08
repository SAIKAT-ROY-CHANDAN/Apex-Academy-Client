import FeeItemConfiguration from './_components/FeeItemConfiguration';
import FeeItemTable from './_components/FeeItemTable';
import { getFeeItems } from '@/services/feeItem';

const PAGE_SIZE = 10;

const FeeItem = async ({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) => {
    const resolvedSearchParams = await searchParams;
    const pageParam = Array.isArray(resolvedSearchParams.page) ? resolvedSearchParams.page[0] : resolvedSearchParams.page;
    const currentPage = Math.max(1, Number(pageParam ?? 1) || 1);

    const feeTypes = await getFeeItems([
        { label: 'page', value: currentPage },
        { label: 'limit', value: PAGE_SIZE },
    ]);

    const feeItems = feeTypes?.data ?? [];
    const totalItems = feeTypes?.meta?.total ?? feeTypes?.meta?.totalItems ?? feeItems.length;
    const totalPages = feeTypes?.meta?.totalPages ?? feeTypes?.meta?.lastPage ?? feeTypes?.meta?.last_page;
    return (
        <div>
            <FeeItemConfiguration />
            <FeeItemTable
                feeItems={feeItems}
                currentPage={currentPage}
                totalItems={totalItems}
                totalPages={totalPages}
            />
        </div>
    );
};

export default FeeItem;