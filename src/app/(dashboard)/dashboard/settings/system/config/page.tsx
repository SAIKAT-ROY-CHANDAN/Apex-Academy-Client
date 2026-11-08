import { PageHeader } from '@/components/shared/page-header'
import { getTeachers } from '@/services/teacher'
import { getDesignations } from '@/services/designation'
import { getShifts } from '@/services/shift'
import { getDepartments } from '@/services/department'
import { getInstitutionDetails } from '@/services/institution'
import { QueryParams } from '@/types/shared/query.type'
import PaginationWrapper from '@/components/shared/PaginationWrapper'
import ConfigTeacherFilter from './_components/ConfigTeacherFilter'
import ConfigTeacherTable from './_components/ConfigTeacherTable'

const OvertimeAddConfig = async (props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const departmentFilterResult = searchParams.departmentFilter;
  const designationFilterResult = searchParams.designationFilter;
  const shiftFilterResult = searchParams.shiftFilter;
  const search = searchParams.search;

  const query: QueryParams[] = [
    {
      label: "page",
      value: page.toString(),
    },
  ];

  if (search && typeof search === "string") {
    query.push({
      label: "searchTerm",
      value: search,
    });
  }

  const filter: Record<string, any> = {};

  if (departmentFilterResult && typeof departmentFilterResult === "string") {
    filter.department_id = departmentFilterResult;
  }

  if (designationFilterResult && typeof designationFilterResult === "string") {
    filter.designation_id = designationFilterResult;
  }

  if (shiftFilterResult && typeof shiftFilterResult === "string") {
    filter.shift_id = shiftFilterResult;
  }

  if (Object.keys(filter).length > 0) {
    query.push({
      label: "filter",
      value: JSON.stringify(filter),
    });
  }

  const [teachers, designationsRes, shiftsRes, departmentsRes, institutionRes] = await Promise.all([
    getTeachers(query),
    getDesignations([{ label: "limit", value: "100" }]),
    getShifts([{ label: "limit", value: "100" }]),
    getDepartments([{ label: "limit", value: "100" }]),
    getInstitutionDetails(),
  ]);


  const mode = institutionRes?.data?.mode ?? "SCHOOL";

  const designations = (designationsRes?.data ?? []).map(
    (d: { id: string; name: string }) => ({ id: d.id, name: d.name }),
  );
  const shifts = (shiftsRes?.data ?? []).map(
    (s: { id: string; name: string }) => ({ id: s.id, name: s.name }),
  );
  const departments = (departmentsRes?.data ?? []).map(
    (d: { id: string; department_name: string }) => ({ id: d.id, name: d.department_name }),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Add Overtime Config"
        backHref="/dashboard/settings/system/overtime"
      />

      <ConfigTeacherFilter
        mode={mode}
        departments={departments}
        designations={designations}
        shifts={shifts}
      />

      <ConfigTeacherTable teachers={teachers?.data || []} mode={mode} />

      {teachers?.meta?.totalPages > 1 && (
        <PaginationWrapper
          totalPages={teachers?.meta?.totalPages}
          totalItems={teachers?.meta?.totalItems}
          active={page}
        />
      )}
    </div>
  )
}

export default OvertimeAddConfig