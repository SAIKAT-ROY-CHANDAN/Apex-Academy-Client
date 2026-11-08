import { PageHeader } from "@/components/shared/page-header";
import GradeSystemTable from "./_components/GradeSystemTable";
import { getGradeSystems } from "@/services/grade-system";

const PAGE_SIZE = 10;

const GradeSystemPage = async ({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) => {
  const resolvedSearchParams = await searchParams;
  const pageParam = Array.isArray(resolvedSearchParams.page) ? resolvedSearchParams.page[0] : resolvedSearchParams.page;
  const currentPage = Math.max(1, Number(pageParam ?? 1) || 1);

  const gradeSystems = await getGradeSystems([
    { label: "page", value: currentPage },
    { label: "limit", value: PAGE_SIZE },
  ]);
  const items = gradeSystems?.data ?? [];
  const totalItems = gradeSystems?.meta?.total ?? gradeSystems?.meta?.totalItems ?? items.length;
  const totalPages = gradeSystems?.meta?.totalPages ?? gradeSystems?.meta?.lastPage ?? gradeSystems?.meta?.last_page;

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Grade System" 
        backHref="/dashboard/academics" 
      />
      <GradeSystemTable 
        gradeSystems={items} 
        currentPage={currentPage} 
        totalItems={totalItems} 
        totalPages={totalPages} 
      />
    </div>
  );
};

export default GradeSystemPage;
