import { getDepartments } from '@/services/department';
import DepartmentConfiguration from './_components/DepartmentConfiguration';
import DepartmentTable from './_components/DepartmentTable';

const PAGE_SIZE = 10;

const Department = async ({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) => {
    const resolvedSearchParams = await searchParams;
    const pageParam = Array.isArray(resolvedSearchParams.page) ? resolvedSearchParams.page[0] : resolvedSearchParams.page;
    const currentPage = Math.max(1, Number(pageParam ?? 1) || 1);

    const departments = await getDepartments([
        { label: 'page', value: currentPage },
        { label: 'limit', value: PAGE_SIZE },
    ]);
    const items = departments?.data ?? [];
    const totalItems = departments?.meta?.total ?? departments?.meta?.totalItems ?? items.length;
    const totalPages = departments?.meta?.totalPages ?? departments?.meta?.lastPage ?? departments?.meta?.last_page;
    return (
        <div>
            <DepartmentConfiguration />
            <DepartmentTable departments={items} currentPage={currentPage} totalItems={totalItems} totalPages={totalPages} />

        </div>
    );
};

export default Department;