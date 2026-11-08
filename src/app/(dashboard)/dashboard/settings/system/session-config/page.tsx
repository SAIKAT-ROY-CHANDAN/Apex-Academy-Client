import { getAcademicSessions } from '@/services/academicSession';
import AcademicSessionConfiguration from './_components/AcademicSessionConfiguration';
import AcademicSessionTable from './_components/AcademicSessionTable';

const PAGE_SIZE = 10;

const AcademicSession = async ({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) => {
    const resolvedSearchParams = await searchParams;
    const pageParam = Array.isArray(resolvedSearchParams.page) ? resolvedSearchParams.page[0] : resolvedSearchParams.page;
    const currentPage = Math.max(1, Number(pageParam ?? 1) || 1);

    const academicSessions = await getAcademicSessions([
        { label: 'page', value: currentPage },
        { label: 'limit', value: PAGE_SIZE },
    ]);
    const items = academicSessions?.data ?? [];
    const totalItems = academicSessions?.meta?.total ?? academicSessions?.meta?.totalItems ?? items.length;
    const totalPages = academicSessions?.meta?.totalPages ?? academicSessions?.meta?.lastPage ?? academicSessions?.meta?.last_page;

    return (
        <div>
            <AcademicSessionConfiguration />
            <AcademicSessionTable sessions={items} currentPage={currentPage} totalItems={totalItems} totalPages={totalPages} />
        </div>
    );
};

export default AcademicSession;
