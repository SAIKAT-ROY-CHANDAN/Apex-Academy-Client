import React from 'react';
import BatchConfiguration from './_components/BatchConfiguration';
import BatchTable from './_components/BatchTable';
import { getBatchDetails } from '@/services/batch';

const PAGE_SIZE = 10;

const Batch = async ({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) => {
    const resolvedSearchParams = await searchParams;
    const pageParam = Array.isArray(resolvedSearchParams.page) ? resolvedSearchParams.page[0] : resolvedSearchParams.page;
    const currentPage = Math.max(1, Number(pageParam ?? 1) || 1);

    const batches = await getBatchDetails([
        { label: 'page', value: currentPage },
        { label: 'limit', value: PAGE_SIZE },
    ]);
    const items = batches?.data ?? [];
    const totalItems = batches?.meta?.total ?? batches?.meta?.totalItems ?? items.length;
    const totalPages = batches?.meta?.totalPages ?? batches?.meta?.lastPage ?? batches?.meta?.last_page;
    return (
        <div>
            <BatchConfiguration />
            <BatchTable batches={items} currentPage={currentPage} totalItems={totalItems} totalPages={totalPages} />
        </div>
    );
};

export default Batch;