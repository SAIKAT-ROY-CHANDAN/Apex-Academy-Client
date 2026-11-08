import React from 'react';
import DepositTypeConfiguration from './_components/DepositTypeConfiguration';
import DepositTypeTable from './_components/DepositTypeTable';
import { getDepositTypes } from '@/services/depositType';

const PAGE_SIZE = 10;

const DepositType = async ({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) => {
    const resolvedSearchParams = await searchParams;
    const pageParam = Array.isArray(resolvedSearchParams.page) ? resolvedSearchParams.page[0] : resolvedSearchParams.page;
    const currentPage = Math.max(1, Number(pageParam ?? 1) || 1);

    const depositTypes = await getDepositTypes([
        { label: 'page', value: currentPage },
        { label: 'limit', value: PAGE_SIZE },
    ])
    const items = depositTypes?.data ?? [];
    const totalItems = depositTypes?.meta?.total ?? depositTypes?.meta?.totalItems ?? items.length;
    const totalPages = depositTypes?.meta?.totalPages ?? depositTypes?.meta?.lastPage ?? depositTypes?.meta?.last_page;
    return (
        <div>
            <DepositTypeConfiguration />
            <DepositTypeTable depositTypes={items} currentPage={currentPage} totalItems={totalItems} totalPages={totalPages} />
        </div>
    );
};

export default DepositType;