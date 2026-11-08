import ProgramConfiguration from './_components/ProgramConfiguration';
import { getPrograms } from '@/services/program';
import ProgramTable from './_components/ProgramTable';

const PAGE_SIZE = 10;

const Program = async ({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) => {
  const resolvedSearchParams = await searchParams;
  const pageParam = Array.isArray(resolvedSearchParams.page) ? resolvedSearchParams.page[0] : resolvedSearchParams.page;
  const currentPage = Math.max(1, Number(pageParam ?? 1) || 1);

  const programs = await getPrograms([
    { label: 'page', value: currentPage },
    { label: 'limit', value: PAGE_SIZE },
  ]);
  const items = programs?.data ?? [];
  const totalItems = programs?.meta?.total ?? programs?.meta?.totalItems ?? items.length;
  const totalPages = programs?.meta?.totalPages ?? programs?.meta?.lastPage ?? programs?.meta?.last_page;

  return (
    <div>
      <ProgramConfiguration />
      <ProgramTable programs={items} currentPage={currentPage} totalItems={totalItems} totalPages={totalPages} />
    </div>
  );
};

export default Program;