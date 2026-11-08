import SubjectConfiguration from './_components/SubjectConfiguration';
import { getSubjectDetails } from '@/services/subject';
import SubjectTable from './_components/SubjectTable';

const PAGE_SIZE = 10;

type SubjectSearchParams = {
  page?: string | string[];
  programId?: string | string[];
  departmentId?: string | string[];
  levelYear?: string | string[];
  // backwards-compat snake_case
  program_id?: string | string[];
  department_id?: string | string[];
  year_level?: string | string[];
  searchTerm?: string | string[];
};

function firstParam(v?: string | string[]) {
  return Array.isArray(v) ? v[0] : v;
}

const Subject = async ({ searchParams }: { searchParams: Promise<SubjectSearchParams> }) => {
  const resolvedSearchParams = await searchParams;
  const currentPage = Math.max(1, Number(firstParam(resolvedSearchParams.page) ?? 1) || 1);
  const programId = firstParam(resolvedSearchParams.programId ?? resolvedSearchParams.program_id);
  const departmentId = firstParam(resolvedSearchParams.departmentId ?? resolvedSearchParams.department_id);
  const levelYear = firstParam(resolvedSearchParams.levelYear ?? resolvedSearchParams.year_level);
  const searchTerm = firstParam(resolvedSearchParams.searchTerm);

  const query: { label: string; value: string | number }[] = [
    { label: 'page', value: currentPage },
    { label: 'limit', value: PAGE_SIZE },
  ];
  if (programId) query.push({ label: 'programId', value: programId });
  if (departmentId) query.push({ label: 'departmentId', value: departmentId });
  if (levelYear) query.push({ label: 'levelYear', value: levelYear });
  if (searchTerm) query.push({ label: 'searchTerm', value: searchTerm });

  const subjects = await getSubjectDetails(query);
  const items = subjects?.data ?? [];
  const totalItems = subjects?.meta?.total ?? subjects?.meta?.totalItems ?? items.length;
  const totalPages = subjects?.meta?.totalPages ?? subjects?.meta?.lastPage ?? subjects?.meta?.last_page;
  return (
    <div>
      <SubjectConfiguration />
      <SubjectTable
        subjects={items}
        currentPage={currentPage}
        totalItems={totalItems}
        totalPages={totalPages}
        initialProgramId={programId ?? ''}
        initialDepartmentId={departmentId ?? ''}
        initialLevelYear={levelYear ?? ''}
      />
    </div>
  );
};

export default Subject;