import React from 'react';
import HolidayConfiguration from './_components/HolidayConfiguration';
import HolidayTable from './_components/HolidayTable';
import { getHolidays } from '@/services/holiday';

const PAGE_SIZE = 10;

const Holiday = async ({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) => {
    const resolvedSearchParams = await searchParams;
    const pageParam = Array.isArray(resolvedSearchParams.page) ? resolvedSearchParams.page[0] : resolvedSearchParams.page;
    const currentPage = Math.max(1, Number(pageParam ?? 1) || 1);

    const holidays = await getHolidays([
        { label: 'page', value: currentPage },
        { label: 'limit', value: PAGE_SIZE },
    ])
    const items = holidays?.data ?? [];
    const totalItems = holidays?.meta?.total ?? holidays?.meta?.totalItems ?? items.length;
    const totalPages = holidays?.meta?.totalPages ?? holidays?.meta?.lastPage ?? holidays?.meta?.last_page;
    return (
        <div>
            <HolidayConfiguration />
            <HolidayTable holidays={items} currentPage={currentPage} totalItems={totalItems} totalPages={totalPages} />
        </div>
    );
};

export default Holiday;