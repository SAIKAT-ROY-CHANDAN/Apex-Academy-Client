import ClassConfiguration from './ClassConfiguration';
import { getAcademicClassDetails } from '@/services/academicClass';
import { getInstitutionDetails } from '@/services/institution';
import { getPrograms } from '@/services/program';
import { getDepartments } from '@/services/department';

const PAGE_SIZE = 10;

const Class = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) => {
  const resolvedSearchParams = await searchParams;
  const pageParam = Array.isArray(resolvedSearchParams.page)
    ? resolvedSearchParams.page[0]
    : resolvedSearchParams.page;
  const currentPage = Math.max(1, Number(pageParam ?? 1) || 1);

  const [classes, institutionData, programsData, departmentsData] =
    await Promise.all([
      getAcademicClassDetails([
        { label: 'page', value: currentPage },
        { label: 'limit', value: PAGE_SIZE },
      ]),
      getInstitutionDetails(),
      getPrograms([{ label: 'limit', value: '100' }]),
      getDepartments([{ label: 'limit', value: '100' }]),
    ]);

  const items = classes?.data ?? [];
  const totalItems =
    classes?.meta?.total ?? classes?.meta?.totalItems ?? items.length;
  const totalPages =
    classes?.meta?.totalPages ??
    classes?.meta?.lastPage ??
    classes?.meta?.last_page;

  const programs = programsData?.data ?? [];
  const departments = departmentsData?.data ?? [];

  return (
    <ClassConfiguration
      initialClasses={items}
      institution={institutionData?.data?.mode}
      institutionId={institutionData?.data?.id ?? ''}
      programs={programs}
      departments={departments}
      currentPage={currentPage}
      totalItems={totalItems}
      totalPages={totalPages}
    />
  );
};

export default Class;
