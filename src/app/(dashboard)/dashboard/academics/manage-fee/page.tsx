import React from 'react';
import FeeTypeConfiguration from './_components/FeeTypeConfiguration';
import { getFeeTypes } from '@/services/feeType';
import FeeTypeTable from './_components/FeeTypeTable';

const PAGE_SIZE = 10;

const FeeType = async ({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) => {
    const resolvedSearchParams = await searchParams;
    const pageParam = Array.isArray(resolvedSearchParams.page) ? resolvedSearchParams.page[0] : resolvedSearchParams.page;
    const currentPage = Math.max(1, Number(pageParam ?? 1) || 1);

    const feeTypes = await getFeeTypes([
        { label: 'page', value: currentPage },
        { label: 'limit', value: PAGE_SIZE },
    ])
    const items = feeTypes?.data ?? [];
    const totalItems = feeTypes?.meta?.total ?? feeTypes?.meta?.totalItems ?? items.length;
    const totalPages = feeTypes?.meta?.totalPages ?? feeTypes?.meta?.lastPage ?? feeTypes?.meta?.last_page;
    return (
        <div>
            <FeeTypeConfiguration />
            <FeeTypeTable feeTypes={items} currentPage={currentPage} totalItems={totalItems} totalPages={totalPages} />
        </div>
    );
};

export default FeeType;